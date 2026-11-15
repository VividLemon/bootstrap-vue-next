# Upstream migration guide (plain-markdown copy)

Converted from BootstrapVueNext `apps/docs/src/docs/migration-data/**` at commit `07767892` (v1.2.2).
Docs-site components (`<DeprecatedFeature>`, `<BLink>`, `<<< DEMO` includes, `<ShowHideProps/>`) were rendered to plain
markdown and code blocks; site-relative links point at https://bootstrap-vue-next.github.io/bootstrap-vue-next.
Each file keeps a trimmed frontmatter: `match` (strings to grep for), `replacement` (old → new), `deprecated`,
`safeRewrite` (true = mostly mechanical) and `confidence`.

**Known errors in these files are listed in `../guide-corrections-and-gaps.md` — read that too.**

| File | Title | Affects | Safe auto-rewrite |
|---|---|---|---|
| [patterns/component-aliases.md](patterns/component-aliases.md) | Component Alias Migration | BootstrapVueNextResolver | yes |
| [patterns/native-events.md](patterns/native-events.md) | Native Event Documentation Migration |  | no |
| [patterns/overview.md](patterns/overview.md) | BootstrapVue to BootstrapVueNext Migration Overview | BootstrapVueNext | no |
| [patterns/show-hide.md](patterns/show-hide.md) | Show and Hide Prop Migration | BCollapse, BModal, BPlaceholder, BToast | no |
| [patterns/sync-modifier.md](patterns/sync-modifier.md) | Sync Modifier Migration | BFormCheckbox | yes |
| [patterns/v-html-props.md](patterns/v-html-props.md) | HTML Prop to Slot Migration | BBreadcrumbItem, BCard, BCarouselSlide, BDropdown … | no |
| [components/baccordion.md](components/baccordion.md) | BAccordion Migration | BAccordion, BAccordionItem, BCollapse | no |
| [components/balert.md](components/balert.md) | BAlert Migration | BAlert | yes |
| [components/bavatar.md](components/bavatar.md) | BAvatar Migration | BAvatar, BLink | yes |
| [components/bbadge.md](components/bbadge.md) | BBadge Migration | BBadge | yes |
| [components/bbreadcrumb.md](components/bbreadcrumb.md) | BBreadcrumb Migration | BBreadcrumb | yes |
| [components/bbutton.md](components/bbutton.md) | BButton Migration | BButton, BLink | yes |
| [components/bbuttonclose.md](components/bbuttonclose.md) | BButtonClose Migration | BButtonClose, BCloseButton, BLink | yes |
| [components/bcalendar.md](components/bcalendar.md) | BCalendar Migration | BCalendar | no |
| [components/bcard.md](components/bcard.md) | BCard Migration | BCard, BCardImg, BCardBody, BCardHeader … | yes |
| [components/bcardgroup.md](components/bcardgroup.md) | BCardGroup Migration | BCardGroup | yes |
| [components/bcardimglazy.md](components/bcardimglazy.md) | BCardImgLazy Migration | BCardImgLazy, BImg | yes |
| [components/bcarousel.md](components/bcarousel.md) | BCarousel Migration | BCarousel, BCarouselSlide | yes |
| [components/bcollapse.md](components/bcollapse.md) | BCollapse Migration | BCollapse, BAccordion, BLink | yes |
| [components/bdropdown.md](components/bdropdown.md) | BDropdown Migration | BDropdown, BDropdownDivider, BDropdownForm, BForm … | no |
| [components/bembed.md](components/bembed.md) | BEmbed Migration | BEmbed | no |
| [components/bform.md](components/bform.md) | BForm Migration | BForm, BFormRow, BFormDatalist, BFormRadioGroup … | yes |
| [components/bformcheckbox.md](components/bformcheckbox.md) | BFormCheckbox Migration | BFormCheckbox | yes |
| [components/bformdatepicker.md](components/bformdatepicker.md) | BFormDatePicker Migration | BFormDatePicker, BFormDatepicker | no |
| [components/bformfile.md](components/bformfile.md) | BFormFile Migration | BFormFile | yes |
| [components/bformgroup.md](components/bformgroup.md) | BFormGroup Migration | BFormGroup | yes |
| [components/bforminput.md](components/bforminput.md) | BFormInput Migration | BFormInput | yes |
| [components/bformradio.md](components/bformradio.md) | BFormRadio Migration | BFormRadio, BFormRadioGroup, BFormCheckboxGroup, BFormSelect | yes |
| [components/bformrating.md](components/bformrating.md) | BFormRating Migration | BFormRating, BLink | no |
| [components/bformselect.md](components/bformselect.md) | BFormSelect Migration | BFormSelect | yes |
| [components/bformspinbutton.md](components/bformspinbutton.md) | BFormSpinButton Migration | BFormSpinButton | yes |
| [components/bformtags.md](components/bformtags.md) | BFormTags Migration | BFormTags, BFormSelect | yes |
| [components/bformtextarea.md](components/bformtextarea.md) | BFormTextarea Migration | BFormTextarea, BLink | yes |
| [components/bformtimepicker.md](components/bformtimepicker.md) | BFormTimePicker Migration | BFormTimePicker, BFormTimepicker | no |
| [components/bimg.md](components/bimg.md) | BImg Migration | BImg, BImgLazy, BCardImgLazy | yes |
| [components/bimglazy.md](components/bimglazy.md) | BImgLazy Migration | BImgLazy, BImg | yes |
| [components/binputgroup.md](components/binputgroup.md) | BInputGroup Migration | BInputGroup, BInputGroupAppend, BInputGroupPrepend, BInputGroupAddon … | yes |
| [components/bjumbotron.md](components/bjumbotron.md) | BJumbotron Migration | BJumbotron | yes |
| [components/blink.md](components/blink.md) | BLink Migration | BLink | yes |
| [components/blistgroup.md](components/blistgroup.md) | BListGroup Migration | BListGroup | yes |
| [components/bmedia.md](components/bmedia.md) | BMedia Migration | BMedia, BLink | yes |
| [components/bmodal.md](components/bmodal.md) | BModal Migration | BModal, BLink, BApp | no |
| [components/bnav.md](components/bnav.md) | BNav Migration | BNav, BDropdown | yes |
| [components/bnavbar.md](components/bnavbar.md) | BNavbar Migration | BNavbar | yes |
| [components/boverlay.md](components/boverlay.md) | BOverlay Migration | BOverlay | yes |
| [components/bpagination.md](components/bpagination.md) | BPagination Migration | BPagination | yes |
| [components/bpaginationnav.md](components/bpaginationnav.md) | BPaginationNav Migration | BPaginationNav | no |
| [components/bpopover.md](components/bpopover.md) | BPopover Migration | BPopover | no |
| [components/bprogressbar.md](components/bprogressbar.md) | BProgressBar Migration | BProgressBar | yes |
| [components/bsidebar.md](components/bsidebar.md) | BSidebar to BOffcanvas Migration | BSidebar, BOffcanvas | no |
| [components/bskeleton.md](components/bskeleton.md) | BSkeleton Migration | BSkeleton, BPlaceholderButton, BPlaceholder, BSkeletonIcon … | no |
| [components/btable.md](components/btable.md) | BTable Migration | BTable, BTbody, BThead, BTfoot … | no |
| [components/btablelight.md](components/btablelight.md) | BTableLight Migration | BTableLight | yes |
| [components/btablesimple.md](components/btablesimple.md) | BTableSimple Migration | BTableSimple | yes |
| [components/btabs.md](components/btabs.md) | BTabs Migration | BTabs | yes |
| [components/btime.md](components/btime.md) | BTime Migration | BTime | no |
| [components/btoast.md](components/btoast.md) | BToast Migration | BToast | no |
| [components/btoaster.md](components/btoaster.md) | BToaster Migration | BToaster, BApp | yes |
| [components/btooltip.md](components/btooltip.md) | BTooltip Migration | BTooltip | no |
| [components/grid.md](components/grid.md) | Grid Migration | BCol | yes |
| [directives/v-b-hover.md](directives/v-b-hover.md) | v-b-hover Migration | BLink | yes |
| [directives/v-b-modal.md](directives/v-b-modal.md) | v-b-modal Migration |  | yes |
| [directives/v-b-popover.md](directives/v-b-popover.md) | v-b-popover Migration | BPopover | no |
| [directives/v-b-tooltip.md](directives/v-b-tooltip.md) | v-b-tooltip Migration |  | yes |
| [directives/v-b-visible.md](directives/v-b-visible.md) | v-b-visible Migration | BLink | yes |
| [props/rounded-radius-element.md](props/rounded-radius-element.md) | RadiusElementExtendables Rounding Migration | BAvatar, BAvatarGroup, BCardImg, BImg … | yes |
