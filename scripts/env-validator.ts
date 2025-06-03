/**
 * Environment Variables Validator
 * Checks all required environment variables and their validity
 */

interface EnvVar {
  name: string
  required: boolean
  type: "string" | "number" | "boolean" | "url" | "jwt" | "api_key"
  description: string
  example?: string
  validation?: (value: string) => boolean
}

const REQUIRED_ENV_VARS: EnvVar[] = [
  // Supabase Configuration
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    type: "url",
    description: "Supabase project URL",
    example: "https://your-project.supabase.co",
    validation: (val) => val.includes("supabase.co"),
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    type: "jwt",
    description: "Supabase anonymous key (public)",
    validation: (val) => val.startsWith("eyJ"),
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    type: "jwt",
    description: "Supabase service role key (server-only)",
    validation: (val) => val.startsWith("eyJ"),
  },
  {
    name: "SUPABASE_JWT_SECRET",
    required: true,
    type: "string",
    description: "JWT secret for token validation",
    validation: (val) => val.length >= 32,
  },
  {
    name: "SUPABASE_URL",
    required: false,
    type: "url",
    description: "Alternative Supabase URL (usually same as public)",
  },
  {
    name: "SUPABASE_ANON_KEY",
    required: false,
    type: "jwt",
    description: "Alternative anon key (usually same as public)",
  },

  // Database Configuration
  {
    name: "POSTGRES_HOST",
    required: true,
    type: "string",
    description: "PostgreSQL host",
    example: "db.your-project.supabase.co",
  },
  {
    name: "POSTGRES_USER",
    required: true,
    type: "string",
    description: "PostgreSQL username",
    example: "postgres",
  },
  {
    name: "POSTGRES_PASSWORD",
    required: true,
    type: "string",
    description: "PostgreSQL password",
    validation: (val) => val.length >= 8,
  },
  {
    name: "POSTGRES_DATABASE",
    required: true,
    type: "string",
    description: "PostgreSQL database name",
    example: "postgres",
  },
  {
    name: "POSTGRES_URL",
    required: true,
    type: "url",
    description: "Full PostgreSQL connection URL",
    validation: (val) => val.startsWith("postgres://"),
  },
  {
    name: "POSTGRES_PRISMA_URL",
    required: false,
    type: "url",
    description: "Prisma-specific PostgreSQL URL",
  },
  {
    name: "POSTGRES_URL_NON_POOLING",
    required: false,
    type: "url",
    description: "Non-pooling PostgreSQL URL",
  },

  // Redis/Upstash Configuration
  {
    name: "KV_URL",
    required: true,
    type: "url",
    description: "Redis/KV connection URL",
    validation: (val) => val.startsWith("redis"),
  },
  {
    name: "KV_REST_API_URL",
    required: true,
    type: "url",
    description: "Upstash REST API URL",
    validation: (val) => val.includes("upstash.io"),
  },
  {
    name: "KV_REST_API_TOKEN",
    required: true,
    type: "api_key",
    description: "Upstash REST API token",
    validation: (val) => val.length >= 20,
  },
  {
    name: "KV_REST_API_READ_ONLY_TOKEN",
    required: false,
    type: "api_key",
    description: "Upstash read-only token",
  },
  {
    name: "REDIS_URL",
    required: false,
    type: "url",
    description: "Alternative Redis URL",
  },

  // AI Services
  {
    name: "GROQ_API_KEY",
    required: true,
    type: "api_key",
    description: "Groq AI API key",
    validation: (val) => val.startsWith("gsk_"),
  },
  {
    name: "groq_GROQ_API_KEY",
    required: false,
    type: "api_key",
    description: "Alternative Groq API key",
  },
  {
    name: "XAI_API_KEY",
    required: true,
    type: "api_key",
    description: "XAI (Grok) API key",
    validation: (val) => val.startsWith("xai-"),
  },

  // Vercel Configuration
  {
    name: "VERCEL_OIDC_TOKEN",
    required: false,
    type: "jwt",
    description: "Vercel OIDC token for deployment",
  },

  // Custom Application Variables
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: false,
    type: "url",
    description: "Application base URL",
    example: "https://your-app.vercel.app",
  },
  {
    name: "JWT_SECRET_KEY",
    required: false,
    type: "string",
    description: "Custom JWT secret (if different from Supabase)",
  },
  {
    name: "ACCESS_TOKEN_EXPIRE_MINUTES",
    required: false,
    type: "number",
    description: "Token expiration time in minutes",
    example: "60",
  },

  // Legacy/Alternative Variables
  {
    name: "REACT_APP_SUPABASE_ANON_KEY",
    required: false,
    type: "jwt",
    description: "Legacy React app anon key (use NEXT_PUBLIC instead)",
  },
  {
    name: "DATABASE",
    required: false,
    type: "string",
    description: "Alternative database name",
  },
]

class EnvironmentValidator {
  private results: Array<{
    name: string
    status: "valid" | "invalid" | "missing" | "warning"
    message: string
    value?: string
  }> = []

  validateAll() {
    console.log("🔍 Validating Environment Variables...\n")

    for (const envVar of REQUIRED_ENV_VARS) {
      this.validateEnvVar(envVar)
    }

    this.generateReport()
    return this.results
  }

  private validateEnvVar(envVar: EnvVar) {
    const value = process.env[envVar.name]

    if (!value) {
      this.results.push({
        name: envVar.name,
        status: envVar.required ? "missing" : "warning",
        message: envVar.required ? "Required but missing" : "Optional - not set",
      })
      return
    }

    // Basic validation
    if (envVar.validation && !envVar.validation(value)) {
      this.results.push({
        name: envVar.name,
        status: "invalid",
        message: "Value format is invalid",
        value: this.maskSensitiveValue(envVar.name, value),
      })
      return
    }

    // Type-specific validation
    const typeValidation = this.validateType(envVar.type, value)
    if (!typeValidation.valid) {
      this.results.push({
        name: envVar.name,
        status: "invalid",
        message: typeValidation.message,
        value: this.maskSensitiveValue(envVar.name, value),
      })
      return
    }

    this.results.push({
      name: envVar.name,
      status: "valid",
      message: "Valid",
      value: this.maskSensitiveValue(envVar.name, value),
    })
  }

  private validateType(type: string, value: string): { valid: boolean; message: string } {
    switch (type) {
      case "url":
        try {
          new URL(value)
          return { valid: true, message: "Valid URL" }
        } catch {
          return { valid: false, message: "Invalid URL format" }
        }

      case "number":
        if (isNaN(Number(value))) {
          return { valid: false, message: "Not a valid number" }
        }
        return { valid: true, message: "Valid number" }

      case "boolean":
        if (!["true", "false", "1", "0"].includes(value.toLowerCase())) {
          return { valid: false, message: "Not a valid boolean" }
        }
        return { valid: true, message: "Valid boolean" }

      case "jwt":
        if (!value.startsWith("eyJ")) {
          return { valid: false, message: "Invalid JWT format" }
        }
        const parts = value.split(".")
        if (parts.length !== 3) {
          return { valid: false, message: "JWT should have 3 parts" }
        }
        return { valid: true, message: "Valid JWT format" }

      case "api_key":
        if (value.length < 10) {
          return { valid: false, message: "API key too short" }
        }
        return { valid: true, message: "Valid API key format" }

      default:
        return { valid: true, message: "Valid string" }
    }
  }

  private maskSensitiveValue(name: string, value: string): string {
    const sensitivePatterns = ["KEY", "SECRET", "TOKEN", "PASSWORD"]

    if (sensitivePatterns.some((pattern) => name.includes(pattern))) {
      if (value.length <= 10) {
        return "***"
      }
      return value.substring(0, 6) + "..." + value.substring(value.length - 4)
    }

    return value.length > 50 ? value.substring(0, 47) + "..." : value
  }

  private generateReport() {
    console.log("\n📊 ENVIRONMENT VALIDATION REPORT")
    console.log("=".repeat(60))

    const valid = this.results.filter((r) => r.status === "valid").length
    const invalid = this.results.filter((r) => r.status === "invalid").length
    const missing = this.results.filter((r) => r.status === "missing").length
    const warnings = this.results.filter((r) => r.status === "warning").length

    console.log(`✅ Valid: ${valid}`)
    console.log(`❌ Invalid: ${invalid}`)
    console.log(`🚫 Missing: ${missing}`)
    console.log(`⚠️  Warnings: ${warnings}`)

    if (missing > 0) {
      console.log("\n🚫 MISSING REQUIRED VARIABLES:")
      this.results
        .filter((r) => r.status === "missing")
        .forEach((r) => {
          const envVar = REQUIRED_ENV_VARS.find((e) => e.name === r.name)
          console.log(`   ❌ ${r.name}: ${r.message}`)
          if (envVar?.description) {
            console.log(`      Description: ${envVar.description}`)
          }
          if (envVar?.example) {
            console.log(`      Example: ${envVar.example}`)
          }
        })
    }

    if (invalid > 0) {
      console.log("\n❌ INVALID VARIABLES:")
      this.results
        .filter((r) => r.status === "invalid")
        .forEach((r) => {
          console.log(`   ❌ ${r.name}: ${r.message}`)
          if (r.value) {
            console.log(`      Current value: ${r.value}`)
          }
        })
    }

    if (warnings > 0) {
      console.log("\n⚠️  OPTIONAL VARIABLES:")
      this.results
        .filter((r) => r.status === "warning")
        .forEach((r) => {
          console.log(`   ⚠️  ${r.name}: ${r.message}`)
        })
    }

    console.log("\n" + "=".repeat(60))

    if (missing === 0 && invalid === 0) {
      console.log("🎉 ALL REQUIRED ENVIRONMENT VARIABLES ARE VALID!")
    } else {
      console.log("🚨 PLEASE FIX THE ISSUES ABOVE BEFORE DEPLOYMENT")
    }

    // Provide setup instructions
    this.generateSetupInstructions()
  }

  private generateSetupInstructions() {
    const missingRequired = this.results.filter((r) => r.status === "missing")

    if (missingRequired.length > 0) {
      console.log("\n📝 SETUP INSTRUCTIONS:")
      console.log("Add these to your .env file:")
      console.log("")

      missingRequired.forEach((result) => {
        const envVar = REQUIRED_ENV_VARS.find((e) => e.name === result.name)
        console.log(`# ${envVar?.description || "Required variable"}`)
        console.log(`${result.name}="${envVar?.example || "your-value-here"}"`)
        console.log("")
      })
    }
  }
}

// Export for use
export { EnvironmentValidator, REQUIRED_ENV_VARS }

// Auto-run if called directly
if (typeof window === "undefined") {
  const validator = new EnvironmentValidator()
  validator.validateAll()
}
