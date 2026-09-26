"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight, ChevronDown, Menu, Search, X } from "lucide-react"
import { NAV_GROUPS, PRIMARY_LINKS, type NavGroup } from "@/lib/site/nav"
import { CommandPalette, type PaletteEntry } from "./CommandPalette"
import { keepRanges } from "./Rich"

function useIsActive() {
  const pathname = usePathname()
  return useCallback(
    (href?: string) => {
      if (!href) return false
      const base = href.split(/[?#]/)[0]
      if (base === "/") return pathname === "/"
      return pathname === base || pathname.startsWith(base + "/")
    },
    [pathname],
  )
}

function Logo() {
  return (
    <Link href="/" aria-label="execom home" className="group flex items-center shrink-0 rounded-md">
      <Image
        src="/execom-logo-full.png"
        alt="execom"
        width={42}
        height={40}
        priority
        className="h-10 w-auto brightness-0 invert opacity-90 transition-opacity group-hover:opacity-100"
      />
    </Link>
  )
}

function MegaPanel({
  group,
  open,
  isActive,
  onNavigate,
  onPointerEnter,
  onPointerLeave,
}: {
  group: NavGroup
  open: boolean
  isActive: (href?: string) => boolean
  onNavigate: () => void
  onPointerEnter: () => void
  onPointerLeave: () => void
}) {
  return (
    <div
      className="s-mega"
      data-open={open ? "true" : undefined}
      id={`mega-${group.key}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="s-mega-inner">
        <div className="p-2">
          <div className="px-3 pt-2 pb-3">
            <p className="s-eyebrow">{group.label}</p>
            <p className="mt-2 text-[13.5px] leading-snug text-haze max-w-[36ch]">{group.thesis}</p>
          </div>
          <ul className="grid gap-0.5">
            {group.items.map((item) => (
              <li key={item.label}>
                {item.href && !item.soon ? (
                  <Link
                    href={item.href}
                    className="s-mega-item"
                    aria-current={isActive(item.href) ? "page" : undefined}
                    onClick={onNavigate}
                    tabIndex={open ? 0 : -1}
                  >
                    <span>
                      <span className="t">{item.label}</span>
                      <span className="d">{keepRanges(item.description)}</span>
                    </span>
                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-fog" aria-hidden />
                  </Link>
                ) : (
                  <div className="s-mega-item" data-soon="true" aria-disabled="true">
                    <span>
                      <span className="t">{item.label}</span>
                      <span className="d">{keepRanges(item.description)}</span>
                    </span>
                    <span className="s-tag mt-0.5">Soon</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="s-mega-feature">
          <div>
            <p className="s-eyebrow s-eyebrow-dot">{group.feature.eyebrow}</p>
            <p className="mt-4 font-display text-[1.6rem] leading-[1.1] tracking-[-0.015em] text-snow">
              {group.feature.title}
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-haze">{keepRanges(group.feature.text)}</p>
          </div>
          <Link
            href={group.feature.cta.href}
            className="s-link mt-6 text-[13.5px]"
            onClick={onNavigate}
            tabIndex={open ? 0 : -1}
          >
            {group.feature.cta.label}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}

function MobileDrawer({
  open,
  onClose,
  onSearch,
  isActive,
}: {
  open: boolean
  onClose: () => void
  onSearch: () => void
  isActive: (href?: string) => boolean
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  return (
    <div className="s-drawer lg:hidden" data-open={open ? "true" : undefined} aria-hidden={!open}>
      <div className="s-container py-6">
        <button
          type="button"
          onClick={onSearch}
          className="s-search-btn w-full justify-between h-11 text-[14px]"
          tabIndex={open ? 0 : -1}
        >
          <span className="inline-flex items-center gap-2.5">
            <Search className="h-4 w-4" strokeWidth={1.75} aria-hidden /> Search execom
          </span>
        </button>

        <nav className="mt-6" aria-label="Mobile">
          {NAV_GROUPS.map((group) => {
            const isOpen = expanded === group.key
            return (
              <div key={group.key} className="border-b border-white/[0.07]" data-open={isOpen ? "true" : undefined}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-4 text-left text-[17px] font-medium text-snow"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : group.key)}
                  tabIndex={open ? 0 : -1}
                >
                  {group.label}
                  <ChevronDown
                    className={`h-4 w-4 text-fog transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                <div className="s-collapse">
                  <div>
                    <p className="pb-3 text-[13.5px] leading-snug text-fog">{group.thesis}</p>
                    <ul className="pb-4">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          {item.href && !item.soon ? (
                            <Link
                              href={item.href}
                              onClick={onClose}
                              aria-current={isActive(item.href) ? "page" : undefined}
                              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-[15px] text-haze hover:bg-white/[0.04] hover:text-snow aria-[current=page]:text-cyan-300"
                              tabIndex={open && isOpen ? 0 : -1}
                            >
                              {item.label}
                              <ArrowRight className="h-3.5 w-3.5 text-fog" aria-hidden />
                            </Link>
                          ) : (
                            <div className="flex items-center justify-between gap-4 px-3 py-2.5 text-[15px] text-fog">
                              {item.label}
                              <span className="s-tag">Soon</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href!}
              onClick={onClose}
              className="flex items-center justify-between border-b border-white/[0.07] py-4 text-[17px] font-medium text-snow"
              tabIndex={open ? 0 : -1}
            >
              {l.label}
              <ArrowRight className="h-4 w-4 text-fog" aria-hidden />
            </Link>
          ))}
        </nav>

        <div className="mt-8 grid gap-3">
          <Link href="/engage" onClick={onClose} className="s-btn s-btn-primary s-btn-lg w-full" tabIndex={open ? 0 : -1}>
            Engage execom
          </Link>
          <Link href="/portal/login" onClick={onClose} className="s-btn s-btn-glass s-btn-lg w-full" tabIndex={open ? 0 : -1}>
            Client portal
          </Link>
        </div>
      </div>
    </div>
  )
}

export function SiteHeader({ searchEntries }: { searchEntries: PaletteEntry[] }) {
  const pathname = usePathname()
  const isActive = useIsActive()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
  }, [])

  // Close everything on navigation
  useEffect(() => {
    setOpenGroup(null)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Keyboard: Cmd/Ctrl+K or "/" opens search, Escape closes menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      } else if (e.key === "/" && !typing) {
        e.preventDefault()
        setPaletteOpen(true)
      } else if (e.key === "Escape") {
        setOpenGroup(null)
        setMobileOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Lock page scroll behind the mobile drawer
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  const hoverOpen = (key: string) => {
    clearTimers()
    openTimer.current = setTimeout(() => setOpenGroup(key), openGroup ? 0 : 70)
  }
  const hoverClose = () => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpenGroup(null), 160)
  }
  const keepOpen = () => clearTimers()

  const solid = scrolled || openGroup !== null || mobileOpen

  return (
    <>
      <header className="s-header" data-solid={solid ? "true" : undefined}>
        <div className="s-container relative flex h-full items-center gap-6">
          <Logo />

          <nav className="hidden lg:flex items-center gap-0.5 ml-4" aria-label="Primary">
            {NAV_GROUPS.map((group) => {
              const open = openGroup === group.key
              const active = group.items.some((i) => isActive(i.href))
              return (
                <div
                  key={group.key}
                  className="relative"
                  onPointerEnter={(e) => e.pointerType === "mouse" && hoverOpen(group.key)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && hoverClose()}
                >
                  <button
                    type="button"
                    className="s-nav-trigger relative"
                    aria-expanded={open}
                    aria-controls={`mega-${group.key}`}
                    data-active={active ? "true" : undefined}
                    onClick={() => {
                      clearTimers()
                      setOpenGroup(open ? null : group.key)
                    }}
                  >
                    {group.label}
                    <ChevronDown className="s-chev h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              )
            })}
            {PRIMARY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href!}
                className="s-nav-trigger relative"
                data-active={isActive(l.href) ? "true" : undefined}
                aria-current={isActive(l.href) ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mega panels are positioned against the header container so they stay centred */}
          <div className="hidden lg:block">
            {NAV_GROUPS.map((group) => (
              <MegaPanel
                key={group.key}
                group={group}
                open={openGroup === group.key}
                isActive={isActive}
                onNavigate={() => setOpenGroup(null)}
                onPointerEnter={keepOpen}
                onPointerLeave={hoverClose}
              />
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="s-search-btn hidden md:inline-flex"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              <span className="hidden xl:inline">Search</span>
              <span className="s-kbd">{isMac ? "⌘K" : "Ctrl K"}</span>
            </button>
            <button
              type="button"
              className="s-icon-btn md:hidden"
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
            </button>
            <Link
              href="/portal/login"
              className="hidden lg:inline-flex s-nav-trigger"
            >
              Client portal
            </Link>
            <Link href="/engage" className="hidden sm:inline-flex s-btn s-btn-primary s-btn-sm">
              Engage
            </Link>
            <button
              type="button"
              className="s-icon-btn lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSearch={() => {
          setMobileOpen(false)
          setPaletteOpen(true)
        }}
        isActive={isActive}
      />

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} entries={searchEntries} />
    </>
  )
}
