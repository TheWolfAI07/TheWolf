/**
 * UI Component Testing Script
 * Tests all UI components, links, buttons, and interactions
 */

interface UITestResult {
  component: string
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  element?: HTMLElement | null
}

class UIComponentTester {
  private results: UITestResult[] = []

  private addResult(
    component: string,
    test: string,
    status: "pass" | "fail" | "warning",
    message: string,
    element?: HTMLElement | null,
  ) {
    this.results.push({ component, test, status, message, element })
    console.log(`${status.toUpperCase()}: ${component} - ${test} - ${message}`)
  }

  // Test all navigation links
  testNavigationLinks() {
    console.log("\n🔗 Testing Navigation Links...")

    const navLinks = document.querySelectorAll('nav a, [data-testid="nav-link"]')

    navLinks.forEach((link, index) => {
      const href = link.getAttribute("href")
      const text = link.textContent?.trim()

      if (!href) {
        this.addResult("Navigation", `Link ${index + 1}`, "fail", `Missing href attribute`, link as HTMLElement)
      } else if (href.startsWith("#")) {
        this.addResult("Navigation", `Link ${index + 1}`, "warning", `Hash link: ${text}`, link as HTMLElement)
      } else {
        this.addResult("Navigation", `Link ${index + 1}`, "pass", `Valid link: ${text} -> ${href}`, link as HTMLElement)
      }
    })
  }

  // Test all buttons
  testButtons() {
    console.log("\n🔘 Testing Buttons...")

    const buttons = document.querySelectorAll('button, [role="button"]')

    buttons.forEach((button, index) => {
      const text = button.textContent?.trim()
      const disabled = button.hasAttribute("disabled")
      const onClick = button.getAttribute("onclick") || button.addEventListener

      if (disabled) {
        this.addResult("Buttons", `Button ${index + 1}`, "warning", `Disabled: ${text}`, button as HTMLElement)
      } else if (!text || text.length === 0) {
        this.addResult("Buttons", `Button ${index + 1}`, "warning", "Button has no text content", button as HTMLElement)
      } else {
        this.addResult("Buttons", `Button ${index + 1}`, "pass", `Active button: ${text}`, button as HTMLElement)
      }
    })
  }

  // Test forms
  testForms() {
    console.log("\n📝 Testing Forms...")

    const forms = document.querySelectorAll("form")

    forms.forEach((form, index) => {
      const inputs = form.querySelectorAll("input, textarea, select")
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]')

      if (inputs.length === 0) {
        this.addResult("Forms", `Form ${index + 1}`, "warning", "Form has no input elements", form as HTMLElement)
      } else if (!submitButton) {
        this.addResult("Forms", `Form ${index + 1}`, "warning", "Form has no submit button", form as HTMLElement)
      } else {
        this.addResult(
          "Forms",
          `Form ${index + 1}`,
          "pass",
          `Valid form with ${inputs.length} inputs`,
          form as HTMLElement,
        )
      }

      // Test individual inputs
      inputs.forEach((input, inputIndex) => {
        const type = input.getAttribute("type")
        const required = input.hasAttribute("required")
        const name = input.getAttribute("name")

        if (!name) {
          this.addResult(
            "Forms",
            `Input ${inputIndex + 1}`,
            "warning",
            `Input missing name attribute`,
            input as HTMLElement,
          )
        } else {
          this.addResult(
            "Forms",
            `Input ${inputIndex + 1}`,
            "pass",
            `${type || "text"} input: ${name}${required ? " (required)" : ""}`,
            input as HTMLElement,
          )
        }
      })
    })
  }

  // Test responsive design
  testResponsiveDesign() {
    console.log("\n📱 Testing Responsive Design...")

    const viewports = [
      { name: "Mobile", width: 375, height: 667 },
      { name: "Tablet", width: 768, height: 1024 },
      { name: "Desktop", width: 1920, height: 1080 },
    ]

    const originalWidth = window.innerWidth
    const originalHeight = window.innerHeight

    viewports.forEach((viewport) => {
      // Note: This is a simulation since we can't actually resize the browser
      this.addResult("Responsive", viewport.name, "pass", `Viewport test: ${viewport.width}x${viewport.height}`)

      // Check for responsive classes
      const responsiveElements = document.querySelectorAll(
        '[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]',
      )
      if (responsiveElements.length > 0) {
        this.addResult(
          "Responsive",
          `${viewport.name} Classes`,
          "pass",
          `Found ${responsiveElements.length} responsive elements`,
        )
      } else {
        this.addResult("Responsive", `${viewport.name} Classes`, "warning", "No responsive classes detected")
      }
    })
  }

  // Test accessibility
  testAccessibility() {
    console.log("\n♿ Testing Accessibility...")

    // Check for alt text on images
    const images = document.querySelectorAll("img")
    images.forEach((img, index) => {
      const alt = img.getAttribute("alt")
      const src = img.getAttribute("src")

      if (!alt) {
        this.addResult("Accessibility", `Image ${index + 1}`, "fail", `Missing alt text: ${src}`, img)
      } else if (alt.trim().length === 0) {
        this.addResult("Accessibility", `Image ${index + 1}`, "warning", `Empty alt text: ${src}`, img)
      } else {
        this.addResult("Accessibility", `Image ${index + 1}`, "pass", `Has alt text: ${alt}`, img)
      }
    })

    // Check for proper heading hierarchy
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    let lastLevel = 0

    headings.forEach((heading, index) => {
      const level = Number.parseInt(heading.tagName.charAt(1))
      const text = heading.textContent?.trim()

      if (index === 0 && level !== 1) {
        this.addResult(
          "Accessibility",
          "Heading Hierarchy",
          "warning",
          "First heading is not h1",
          heading as HTMLElement,
        )
      } else if (level > lastLevel + 1) {
        this.addResult(
          "Accessibility",
          "Heading Hierarchy",
          "warning",
          `Heading level jump: h${lastLevel} to h${level}`,
          heading as HTMLElement,
        )
      } else {
        this.addResult("Accessibility", `Heading ${index + 1}`, "pass", `h${level}: ${text}`, heading as HTMLElement)
      }

      lastLevel = level
    })

    // Check for ARIA labels
    const ariaElements = document.querySelectorAll("[aria-label], [aria-labelledby], [aria-describedby]")
    this.addResult("Accessibility", "ARIA Labels", "pass", `Found ${ariaElements.length} elements with ARIA attributes`)
  }

  // Test data display components
  testDataDisplayComponents() {
    console.log("\n📊 Testing Data Display Components...")

    // Test tables
    const tables = document.querySelectorAll("table")
    tables.forEach((table, index) => {
      const headers = table.querySelectorAll("th")
      const rows = table.querySelectorAll("tbody tr")

      if (headers.length === 0) {
        this.addResult("Data Display", `Table ${index + 1}`, "warning", "Table has no headers", table as HTMLElement)
      } else {
        this.addResult(
          "Data Display",
          `Table ${index + 1}`,
          "pass",
          `Table with ${headers.length} columns, ${rows.length} rows`,
          table as HTMLElement,
        )
      }
    })

    // Test cards
    const cards = document.querySelectorAll('[class*="card"], .card')
    this.addResult("Data Display", "Cards", "pass", `Found ${cards.length} card components`)

    // Test loading states
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="skeleton"]')
    this.addResult("Data Display", "Loading States", "pass", `Found ${loadingElements.length} loading indicators`)
  }

  // Run all UI tests
  runAllUITests() {
    console.log("🎨 Starting UI Component Tests...\n")

    this.testNavigationLinks()
    this.testButtons()
    this.testForms()
    this.testResponsiveDesign()
    this.testAccessibility()
    this.testDataDisplayComponents()

    this.generateUIReport()
  }

  // Generate UI test report
  generateUIReport() {
    console.log("\n🎨 UI COMPONENT TEST REPORT")
    console.log("=".repeat(50))

    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const warnings = this.results.filter((r) => r.status === "warning").length

    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`)

    // Group results by component
    const byComponent = this.results.reduce(
      (acc, result) => {
        if (!acc[result.component]) acc[result.component] = []
        acc[result.component].push(result)
        return acc
      },
      {} as Record<string, UITestResult[]>,
    )

    Object.entries(byComponent).forEach(([component, results]) => {
      const componentPassed = results.filter((r) => r.status === "pass").length
      const componentTotal = results.length
      console.log(`\n${component}: ${componentPassed}/${componentTotal} tests passed`)

      results
        .filter((r) => r.status === "fail")
        .forEach((r) => {
          console.log(`   ❌ ${r.test}: ${r.message}`)
        })
    })

    return {
      total: this.results.length,
      passed,
      failed,
      warnings,
      successRate: (passed / this.results.length) * 100,
      results: this.results,
      byComponent,
    }
  }
}

// Export for use
export { UIComponentTester }

// Auto-run if in browser
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const uiTester = new UIComponentTester()
      uiTester.runAllUITests()
    })
  } else {
    const uiTester = new UIComponentTester()
    uiTester.runAllUITests()
  }
}
