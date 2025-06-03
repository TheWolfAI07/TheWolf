/**
 * Environment Issues Fixer
 * Provides specific fixes for common environment variable issues
 */

interface EnvFix {
  issue: string
  solution: string
  code?: string
}

export class EnvironmentFixer {
  static getCommonFixes(): EnvFix[] {
    return [
      {
        issue: "SUPABASE_SERVICE_ROLE_KEY accessed on client",
        solution: "Ensure service role key is only used server-side",
        code: `
// ❌ Wrong - Don't do this
const client = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)

// ✅ Correct - Server-side only
export const createServerClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Server client should only be used on server')
  }
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
}
        `,
      },
      {
        issue: "Missing NEXT_PUBLIC_ prefix for client-side variables",
        solution: "Add NEXT_PUBLIC_ prefix for variables needed on client",
        code: `
// ❌ Wrong - Not accessible on client
SUPABASE_URL=https://your-project.supabase.co

// ✅ Correct - Accessible on client
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
        `,
      },
      {
        issue: "Duplicate environment variables",
        solution: "Remove duplicate variables and use consistent naming",
        code: `
# Remove duplicates like:
# GROQ_API_KEY=xxx
# groq_GROQ_API_KEY=xxx

# Keep only:
GROQ_API_KEY=your-groq-key
        `,
      },
      {
        issue: "Invalid JWT format",
        solution: "Ensure JWT tokens start with 'eyJ' and have 3 parts",
        code: `
# ❌ Wrong format
SUPABASE_ANON_KEY=invalid-key

# ✅ Correct format
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        `,
      },
      {
        issue: "Missing required database variables",
        solution: "Add all required PostgreSQL connection variables",
        code: `
POSTGRES_HOST=db.your-project.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=postgres
POSTGRES_URL=postgres://postgres:password@host:5432/postgres
        `,
      },
    ]
  }

  static fixEnvironmentFile(envContent: string): string {
    let fixed = envContent

    // Remove duplicate GROQ keys
    if (fixed.includes("GROQ_API_KEY=") && fixed.includes("groq_GROQ_API_KEY=")) {
      fixed = fixed.replace(/groq_GROQ_API_KEY=.*/g, "# Removed duplicate groq_GROQ_API_KEY")
    }

    // Ensure NEXT_PUBLIC prefix for client variables
    const clientVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"]
    clientVars.forEach((varName) => {
      const regex = new RegExp(`^${varName}=(.*)$`, "gm")
      if (fixed.match(regex) && !fixed.includes(`NEXT_PUBLIC_${varName}`)) {
        fixed = fixed.replace(regex, `NEXT_PUBLIC_${varName}=$1`)
      }
    })

    return fixed
  }

  static validateAndFix(): void {
    console.log("🔧 Environment Fixer - Checking for common issues...\n")

    const fixes = this.getCommonFixes()

    fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix.issue}`)
      console.log(`   Solution: ${fix.solution}`)
      if (fix.code) {
        console.log(`   Example:${fix.code}`)
      }
      console.log("")
    })
  }
}

// Auto-run if called directly
if (typeof window === "undefined") {
  EnvironmentFixer.validateAndFix()
}
