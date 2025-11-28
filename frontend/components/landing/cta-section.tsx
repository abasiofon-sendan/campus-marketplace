import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="container py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Ready to get started?</h2>
        <p className="text-lg text-muted-foreground mb-8 text-pretty">
          Join thousands of students buying and selling on UpStart
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-lg px-8">
            Sign Up Now
          </Button>
        </Link>
      </div>
    </section>
  )
}
