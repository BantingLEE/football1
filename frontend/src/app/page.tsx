import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold tracking-tight">
            Welcome to Football Manager
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Build your dream team, manage tactics, and lead your club to glory in this comprehensive football management experience.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>
            <Button size="lg" variant="outline">Learn More</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Club Management</CardTitle>
              <CardDescription>
                Take full control of your club&apos;s operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Manage squad and transfers</li>
                <li>• Develop youth players</li>
                <li>• Handle finances and budgets</li>
                <li>• Upgrade facilities</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tactical Depth</CardTitle>
              <CardDescription>
                Create winning strategies and formations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multiple formations</li>
                <li>• Custom tactics and play styles</li>
                <li>• Real-time match simulation</li>
                <li>• Player instructions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Experience</CardTitle>
              <CardDescription>
                Stay connected with real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Live match events</li>
                <li>• Instant notifications</li>
                <li>• Real-time statistics</li>
                <li>• Interactive dashboards</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Ready to begin your journey? Sign up now and start building your legacy.
          </p>
        </div>
      </div>
    </div>
  )
}
