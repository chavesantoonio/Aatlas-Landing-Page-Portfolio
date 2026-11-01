"""Builds gtm-container.json, a Google Tag Manager export ready to import (Admin > Import Container).

The site pushes GA4-style events to the dataLayer (lib/track.ts, components/Talk.tsx, components/Tracking.tsx).
This container maps them to GA4, Google Ads and Meta. Run: python tracking/make-container.py
"""
import json
from pathlib import Path

T = lambda k, v: {"type": "TEMPLATE", "key": k, "value": v}
B = lambda k, v: {"type": "BOOLEAN", "key": k, "value": "true" if v else "false"}
I = lambda k, v: {"type": "INTEGER", "key": k, "value": str(v)}

ids = {"var": 0, "trig": 0, "tag": 0}


def nid(kind):
    ids[kind] += 1
    return str(ids[kind])


variables, triggers, tags = [], [], []


def const(name, value):
    variables.append({"accountId": "0", "containerId": "0", "variableId": nid("var"), "name": name, "type": "c", "parameter": [T("value", value)]})


def dlv(key):
    variables.append({
        "accountId": "0", "containerId": "0", "variableId": nid("var"), "name": f"DLV - {key}", "type": "v",
        "parameter": [I("dataLayerVersion", 2), B("setDefaultValue", False), T("name", key)],
    })


def event_trigger(event):
    tid = nid("trig")
    triggers.append({
        "accountId": "0", "containerId": "0", "triggerId": tid, "name": f"CE - {event}", "type": "CUSTOM_EVENT",
        "customEventFilter": [{"type": "EQUALS", "parameter": [T("arg0", "{{_event}}"), T("arg1", event)]}],
    })
    return tid


def ga4_event(event, trigger, params):
    tags.append({
        "accountId": "0", "containerId": "0", "tagId": nid("tag"), "name": f"GA4 - {event}", "type": "gaawe",
        "parameter": [
            T("eventName", event),
            T("measurementIdOverride", "{{GA4 Measurement ID}}"),
            B("sendEcommerceData", False),
            {"type": "LIST", "key": "eventSettingsTable", "list": [
                {"type": "MAP", "map": [T("parameter", p), T("parameterValue", "{{DLV - " + p + "}}")]} for p in params
            ]},
        ],
        "firingTriggerId": [trigger], "tagFiringOption": "ONCE_PER_EVENT",
    })


# ids to fill in after import (Variables > User-Defined)
const("GA4 Measurement ID", "G-XXXXXXXXXX")
const("Google Ads Conversion ID", "AW-XXXXXXXXX")
const("Google Ads Lead Label", "XXXXXXXXXXX")
const("Meta Pixel ID", "000000000000000")

EVENTS = {
    "page_view": ["page_location", "page_path", "page_title", "language", "virtual_page"],
    "form_start": ["form_id", "form_location"],
    "form_step": ["form_id", "step_number"],
    "form_step_answer": ["form_id", "step_number", "service", "timeline"],
    "generate_lead": ["form_id", "method", "service", "timeline", "event_id",
                      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"],
    "contact": ["method"],
    "social_click": ["network", "link_url"],
    "select_content": ["content_type", "item_id"],
    "preview_open": ["project", "device"],
    "language_change": ["language_from", "language_to"],
}
for k in sorted({p for ps in EVENTS.values() for p in ps}):
    dlv(k)

trig = {e: event_trigger(e) for e in EVENTS}
INIT = "2147479573"  # built-in "Initialization - All Pages"

# Google tag: GA4 base, page views come from the dataLayer (SPA-safe, one per route and per form step)
tags.append({
    "accountId": "0", "containerId": "0", "tagId": nid("tag"), "name": "Google tag - GA4", "type": "googtag",
    "parameter": [
        T("tagId", "{{GA4 Measurement ID}}"),
        {"type": "LIST", "key": "configSettingsTable", "list": [
            {"type": "MAP", "map": [T("parameter", "send_page_view"), T("parameterValue", "false")]},
        ]},
    ],
    "firingTriggerId": [INIT], "tagFiringOption": "ONCE_PER_LOAD",
})
for e, ps in EVENTS.items():
    ga4_event(e, trig[e], ps)

tags.append({
    "accountId": "0", "containerId": "0", "tagId": nid("tag"), "name": "Conversion Linker", "type": "gclidw",
    "parameter": [B("enableCrossDomain", False), B("enableUrlPassthrough", False), B("enableCookieOverrides", False)],
    "firingTriggerId": [INIT], "tagFiringOption": "ONCE_PER_LOAD",
})
# paused until the Google Ads ids are filled in
tags.append({
    "accountId": "0", "containerId": "0", "tagId": nid("tag"), "name": "Google Ads - Lead (WhatsApp/Instagram)", "type": "awct",
    "parameter": [
        B("enableNewCustomerReporting", False), B("enableConversionLinker", True), B("enableProductReporting", False),
        T("conversionId", "{{Google Ads Conversion ID}}"), T("conversionLabel", "{{Google Ads Lead Label}}"),
        T("orderId", "{{DLV - event_id}}"), B("rdp", False),
    ],
    "firingTriggerId": [trig["generate_lead"]], "tagFiringOption": "ONCE_PER_EVENT", "paused": True,
})
# Meta Pixel, paused until the pixel id is filled in. Lead carries eventID to deduplicate with the Conversions API.
PIXEL_BASE = """<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
if(!window.__acPixel){fbq('init','{{Meta Pixel ID}}');window.__acPixel=1}
fbq('track','PageView');
</script>"""
PIXEL_LEAD = """<script>
if(window.fbq)fbq('track','Lead',{content_name:'{{DLV - service}}',content_category:'{{DLV - method}}'},{eventID:'{{DLV - event_id}}'});
</script>"""
for name, html, t in (("Meta Pixel - PageView", PIXEL_BASE, trig["page_view"]), ("Meta Pixel - Lead", PIXEL_LEAD, trig["generate_lead"])):
    tags.append({
        "accountId": "0", "containerId": "0", "tagId": nid("tag"), "name": name, "type": "html",
        "parameter": [T("html", html), B("supportDocumentWrite", False)],
        "firingTriggerId": [t], "tagFiringOption": "ONCE_PER_EVENT", "paused": True,
    })

container = {
    "exportFormatVersion": 2,
    "exportTime": "2026-10-31 12:00:00",
    "containerVersion": {
        "accountId": "0", "containerId": "0", "containerVersionId": "0",
        "container": {"accountId": "0", "containerId": "0", "name": "Aatlas Portfolio", "publicId": "GTM-XXXXXXX", "usageContext": ["WEB"]},
        "tag": tags, "trigger": triggers, "variable": variables,
        "builtInVariable": [
            {"accountId": "0", "containerId": "0", "type": "PAGE_URL", "name": "Page URL"},
            {"accountId": "0", "containerId": "0", "type": "EVENT", "name": "Event"},
        ],
    },
}
out = Path(__file__).with_name("gtm-container.json")
out.write_text(json.dumps(container, indent=2, ensure_ascii=False), encoding="utf8")
print(f"{out.name}: {len(tags)} tags, {len(triggers)} triggers, {len(variables)} variables")
