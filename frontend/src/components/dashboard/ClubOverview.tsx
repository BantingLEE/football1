'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Club } from '@/types'
import { Users, Calendar, MapPin, Building } from 'lucide-react'

interface ClubOverviewProps {
  club: Club
}

export function ClubOverview({ club }: ClubOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Club Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold">{club.name}</h3>
          <p className="text-sm text-muted-foreground">Founded {club.foundedYear}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">City</p>
              <p className="text-sm text-muted-foreground">{club.city}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Stadium</p>
              <p className="text-sm text-muted-foreground">{club.stadium.name}</p>
              <p className="text-xs text-muted-foreground">
                Capacity: {club.stadium.capacity.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Formation</p>
              <p className="text-sm text-muted-foreground">{club.tacticalPreference.formation}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Youth Academy</p>
              <p className="text-sm text-muted-foreground">Level {club.youthFacility.level}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
