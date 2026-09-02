# PhoneBay Site Plan & Completion Status — v3

## 1. Product vision

PhoneBay is a premium, trust-first mobile marketplace for buying and selling phones. It combines marketplace discovery, professional verification, device history, trusted seller/shop profiles, and dashboard workflows in a mobile-first, investor-ready frontend prototype — deliberately without a real backend, database, payments, or authentication.

## 2. Scope boundaries

**In scope:** UI pages and flows, realistic mock data, interactive frontend states, responsive layouts, basic validation and mock transitions, brand storytelling.

**Out of scope (this phase):** backend APIs, real auth/OTP/email verification, database integration, payments, Firebase/Supabase/MongoDB/GCP, live transactions, data persistence.

## 3. Role model (updated)

Earlier drafts treated buyer/seller/shop as separate account types. In practice, roles overlap and this needs to be reflected in both the data model and the dashboard UI:

Role
Notes

**User**
Base account. Can hold buyer capability, seller capability, or both simultaneously — not an either/or `role` field.

**Seller**
Individual or shop-owned. Can also buy (e.g. sourcing inventory), so a Seller account is not buyer-excluded.

**Shop**
Does verification/testing **and** can directly purchase used phones via buyback/trade-in, then resell as shop inventory — meaning a Shop can also act as a Seller.

**Admin**
Moderates all of the above.

**Wholesaler** *(future)*
Bulk buyer/seller — extension of the Seller role, not a new silo.

**Implication for the data model:** `User.role` should become capability flags (`is_buyer`, `is_seller`) rather than a single enum, since a single account can be both. `Shop` needs a new relationship — `Shop → owns → Listing` (shop acting as seller) — separate from its existing `Shop → services → VerificationRequest` relationship.

## 4. The data model behind the pages

Entity
What it's the source of truth for

`User`
Auth screens, profile, settings — now with dual buyer/seller capability

`Seller`
Seller dashboard, seller profile, seller analytics

`Shop`
Shop dashboard, shop profile, shop reviews — plus shop-as-seller inventory once buyback ships

`Listing`
Marketplace grid, listing detail, create/edit listing

`Order`
Buyer orders, seller order management, disputes

`VerificationRequest` → `DeviceTest` → `Certificate`
Verification dashboard, testing interface, certificate display, device passport

`Review`
Seller reviews, shop reviews, listing trust badges

`Conversation` / `Message`
Messaging

`Dispute` / `AdminReport`
Admin panel, order disputes

`BuybackOffer` *(new)*
Shop trade-in/buyback flow — device evaluated, offer made, ownership transferred to Shop

`BulkLot` / `BulkOrder` *(future)*
Wholesale extension — multi-device lots instead of per-unit listings

Seller, shop, and admin pages remain the missing UI for entities you've already modeled. The two additions above (`BuybackOffer` now, `BulkLot`/`BulkOrder` later) are new UI surfaces, not replacements for anything already built.

## 5. Corrected completion estimate

The original doc stated 78% overall, but its own workstream table averages differently depending on method:

Method
Result

Simple average of the 10 workstreams
**63.5%**

Weighted by rough page count per workstream
**~68%**

Original stated estimate
78%

Using **~65% overall** as the working number avoids a false sense of near-completion heading into the next phase.

Workstream
Completion
Status

Public marketing pages
95%
Mostly complete

Marketplace browsing + listing detail
90%
Mostly complete

Authentication pages
90%
Mostly complete

User dashboard core
85%
Mostly complete

Verification / certificate / passport flows
80%
Mostly complete

Responsive polish + QA
70%
In progress

Accessibility + motion refinement
65%
In progress

Seller-specific pages
25%
Needs build

Shop-specific pages
20%
Needs build

Admin dashboard
15%
Needs build

**Overall (weighted)**
**~65%**

## 6. What's already built

**Marketing:** Home, Marketplace, How It Works, Verification, For Sellers, For Shops, About, Contact.

**Auth:** Sign In, Sign Up, Forgot Password, Email/Phone Verification UI.

**User dashboard:** Overview, My Listings, Create/Edit Listing, Saved Phones, Messages, Orders, Verification Dashboard, Certificates, Device Passport, Profile, Settings.

**Marketplace:** browsable grid, search/filter, product detail, phone cards with seller metadata, trust indicators, mock data.

**Verification UI:** certificate display, passport timeline, testing summary cards, dashboard sections.

## 7. What's still missing, grouped by dependency

**Tier 1 — no dependencies, build first**

- Seller Profile, Seller Dashboard *(reuse existing Listing/Order card patterns)*
- Shop Profile, Shop Dashboard

**Tier 2 — depends on Tier 1 shells existing**

- Seller Analytics
- Seller Reviews, Shop Reviews *(reuse the `Review` entity pattern already built for listings)*
- Verification Jobs, Testing Interface *(core trust mechanic, currently weakest at 20%)*
- Shop Certificates *(mirrors certificate display already built for users)*

**Tier 3 — depends on Tier 1 + 2 data surfaces existing**

- Admin Dashboard overview, Users, Sellers, Listings, Verification Requests, Shops
- Reports, Disputes

**Tier 4 — cross-cutting, do continuously, not as a final pass**

- Responsive QA at 360/390/430/768/1024/1280/1440/1920
- Accessibility (focus states, contrast, keyboard nav, reduced-motion)
- Visual consistency and card/spacing rhythm

**Tier 5 — new, not yet scoped into pages**

- Dual-role dashboard: single profile showing both "My Purchases" and "My Listings," with trust score/reviews aggregated across both roles instead of siloed per role
- Shop buyback / trade-in flow: device intake form → reuse DeviceTest step → offer screen → accept/reject → device converts to Shop-owned Listing
- *(Future, not this phase)* Wholesaler account type, Bulk Lot creation, Bulk Order flow with quantity/grade-based fulfillment instead of per-unit

## 8. Suggested delivery roadmap

**Milestone A — Core product shell** *(complete)*
Marketing, auth, dashboard basics, marketplace browsing.

**Milestone B — Business ecosystem, Tier 1 + 2**
Seller and shop dashboards/profiles, verification jobs, testing interface, reviews, certificates. Highest-leverage milestone — it's what currently makes the product look incomplete from a business-model perspective.

**Milestone C — Operating system, Tier 3**
Admin dashboard, reports, disputes.

**Milestone D — Role flexibility, Tier 5 (buyback + dual-role)**
Shop buyback flow and unified buyer/seller dashboard view. Placed after C because it depends on Seller and Shop dashboard shells already existing to slot into.

**Milestone E — Investor-ready polish**
Final responsive QA sweep, accessibility audit, content refinement, visual consistency review — informed by continuous Tier 4 work, not starting from zero.

**Milestone F — Wholesale extension** *(future phase, not currently scoped)*
Bulk Lot / Bulk Order data model and UI, once the core marketplace and buyback flows are stable. Flagged here so the `Listing`/`Order` UI patterns built in earlier milestones are built with bulk in mind (e.g. don't hardcode "1 device per listing" assumptions into components that bulk will later need to extend).

## 9. What changed from v2

1. Replaced the single `role` field assumption with dual buyer/seller capability, since Sellers and Shops both buy as well as sell.
2. Added `BuybackOffer` as a new entity and Tier 5 flow for shop trade-ins, since Shops now purchase devices directly rather than only testing/certifying them.
3. Added a future Milestone F for wholesale/bulk trading, and flagged a build-time consideration: current `Listing`/`Order` components should avoid hardcoding single-unit assumptions so the bulk extension doesn't require a rewrite later.
4. Kept the v2 corrections (completion math, dependency tiers, continuous polish) unchanged.

## 10. Final status summary

- Strong frontend foundation with premium look and full route coverage for user-facing flows.
- Corrected estimate: **~65% complete**, not 78%.
- Fastest path to feeling "done": Milestone B (seller + shop), since it reuses existing component patterns and completes the trust story.
- Role flexibility (dual buyer/seller, shop buyback) and wholesale are now explicitly planned rather than implicit — reducing the chance of a rebuild when they're introduced.
- Recommended target before final polish: 85–90%.
