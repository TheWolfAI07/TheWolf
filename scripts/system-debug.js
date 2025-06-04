// Wolf Platform System Debug Script
console.log("🐺 Wolf Platform System Debug Script")
console.log("===================================")

// Check environment
console.log("\n📊 Environment Check:")
console.log(`- Node.js version: ${process.version}`)
console.log(`- Platform: ${process.platform}`)
console.log(`- Architecture: ${process.arch}`)
console.log(`- Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`)

// Check CSS files
console.log("\n🎨 CSS Files Check:")
try {
  const fs = require("fs")
  const path = require("path")

  const cssPath = path.join(process.cwd(), "app", "globals.css")
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, "utf8")
    console.log(`- globals.css exists: ✅ (${Math.round(cssContent.length / 1024)} KB)`)

    // Check for common CSS issues
    const cssIssues = []

    if (cssContent.includes("@apply") && !cssContent.includes("@layer")) {
      cssIssues.push("Using @apply without @layer directive")
    }

    if (cssContent.includes("from-teal-400") && !cssContent.includes("@tailwind base")) {
      cssIssues.push("Using Tailwind color utilities without base styles")
    }

    if (cssIssues.length > 0) {
      console.log(`- ⚠️ Potential CSS issues:`)
      cssIssues.forEach((issue) => console.log(`  - ${issue}`))
    } else {
      console.log(`- No common CSS issues detected: ✅`)
    }
  } else {
    console.log(`- globals.css not found: ❌`)
  }
} catch (error) {
  console.log(`- Error checking CSS files: ${error.message}`)
}

// Check Tailwind config
console.log("\n🧩 Tailwind Config Check:")
try {
  const fs = require("fs")
  const path = require("path")

  const configPath = path.join(process.cwd(), "tailwind.config.js")
  if (fs.existsSync(configPath)) {
    console.log(`- tailwind.config.js exists: ✅`)

    // Try to load the config
    try {
      const config = require(configPath)
      console.log(`- Config loaded successfully: ✅`)

      // Check for theme extensions
      if (config.theme && config.theme.extend) {
        console.log(`- Theme extensions found: ✅`)

        // Check for colors
        if (config.theme.extend.colors) {
          console.log(`- Custom colors defined: ✅`)
          console.log(`  - Colors: ${Object.keys(config.theme.extend.colors).join(", ")}`)
        } else {
          console.log(`- No custom colors defined: ⚠️`)
        }
      } else {
        console.log(`- No theme extensions found: ⚠️`)
      }
    } catch (configError) {
      console.log(`- Error loading config: ${configError.message}`)
    }
  } else {
    console.log(`- tailwind.config.js not found: ❌`)
  }
} catch (error) {
  console.log(`- Error checking Tailwind config: ${error.message}`)
}

// Check component files
console.log("\n🧱 Component Check:")
try {
  const fs = require("fs")
  const path = require("path")

  const componentsPath = path.join(process.cwd(), "components")
  if (fs.existsSync(componentsPath)) {
    const componentFiles = fs.readdirSync(componentsPath)
    console.log(`- Components directory exists: ✅ (${componentFiles.length} files/folders)`)

    // Check for debug-button.tsx
    const debugButtonPath = path.join(componentsPath, "debug-button.tsx")
    if (fs.existsSync(debugButtonPath)) {
      console.log(`- debug-button.tsx exists: ✅`)
    } else {
      console.log(`- debug-button.tsx not found: ❌`)
    }

    // Check for navbar.tsx
    const navbarPath = path.join(componentsPath, "navbar.tsx")
    if (fs.existsSync(navbarPath)) {
      console.log(`- navbar.tsx exists: ✅`)
    } else {
      console.log(`- navbar.tsx not found: ⚠️`)
    }
  } else {
    console.log(`- Components directory not found: ❌`)
  }
} catch (error) {
  console.log(`- Error checking component files: ${error.message}`)
}

// Check API files
console.log("\n🌐 API Check:")
try {
  const fs = require("fs")
  const path = require("path")

  const apiPath = path.join(process.cwd(), "lib", "crypto-api.ts")
  if (fs.existsSync(apiPath)) {
    console.log(`- crypto-api.ts exists: ✅`)

    const apiContent = fs.readFileSync(apiPath, "utf8")

    // Check for key functions
    const hasFormatPrice = apiContent.includes("formatPrice")
    const hasFormatLargeNumber = apiContent.includes("formatLargeNumber")
    const hasGetTopCryptocurrencies = apiContent.includes("getTopCryptocurrencies")

    console.log(`- formatPrice function: ${hasFormatPrice ? "✅" : "❌"}`)
    console.log(`- formatLargeNumber function: ${hasFormatLargeNumber ? "✅" : "❌"}`)
    console.log(`- getTopCryptocurrencies function: ${hasGetTopCryptocurrencies ? "✅" : "❌"}`)
  } else {
    console.log(`- crypto-api.ts not found: ❌`)
  }
} catch (error) {
  console.log(`- Error checking API files: ${error.message}`)
}

// Check debug page
console.log("\n🔍 Debug Page Check:")
try {
  const fs = require("fs")
  const path = require("path")

  const debugPath = path.join(process.cwd(), "app", "debug")
  if (fs.existsSync(debugPath)) {
    console.log(`- Debug directory exists: ✅`)

    const debugPagePath = path.join(debugPath, "page.tsx")
    if (fs.existsSync(debugPagePath)) {
      console.log(`- debug/page.tsx exists: ✅`)
    } else {
      console.log(`- debug/page.tsx not found: ❌`)
    }
  } else {
    console.log(`- Debug directory not found: ❌`)
  }
} catch (error) {
  console.log(`- Error checking debug page: ${error.message}`)
}

// Summary
console.log("\n📋 Debug Summary:")
console.log("- Check the issues reported above")
console.log("- Visit /debug in your browser for real-time diagnostics")
console.log("- Use the floating debug button for quick system checks")
console.log("\n🐺 Wolf Platform Debug Complete")
