import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import {
  User,
  Settings as SettingsIcon,
  Building,
  DollarSign,
  
  Map,
  Calendar,
  Shield,
  Database,
  Palette,
  Download,
  Upload,
  Save,
  RotateCcw
} from 'lucide-react'
import { useTheme } from "../System/ThemeManager"

export function Settings() {
  const { currentTheme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')

  // Form states
  const [userProfile, setUserProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@libertyhillisd.org',
    title: 'Facilities Director',
    department: 'Operations',
    phone: '(512) 555-0123'
  })

  const [districtSettings, setDistrictSettings] = useState({
    districtName: 'Liberty Hill Independent School District',
    fiscalYearStart: '09', // September
    defaultCurrency: 'USD',
    timeZone: 'America/Chicago',
    address: '15411 W State Hwy 29, Liberty Hill, TX 78642'
  })

  const [bondBuilderSettings, setBondBuilderSettings] = useState({
    defaultProjectDuration: '18',
    costEscalationRate: '3.5',
    defaultDesignPhase: '25',
    defaultBiddingPhase: '10',
    defaultConstructionPhase: '60',
    defaultCloseoutPhase: '5'
  })

  

  const [mapSettings, setMapSettings] = useState({
    defaultZoom: '12',
    mapStyle: 'satellite',
    showPropertyLines: true,
    showDistrictBoundary: true,
    markerStyle: 'detailed'
  })

  const handleSave = () => {
    // Implement save functionality
  }

  const handleReset = () => {
    // Implement reset functionality
  }

  return (
    <div className="h-full p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 mb-2">
          <SettingsIcon className="h-6 w-6" />
          Application Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your Liberty Hill ISD facilities management preferences and configurations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="district" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            District
          </TabsTrigger>
          
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Map
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={userProfile.firstName}
                    onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={userProfile.lastName}
                    onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={userProfile.title}
                    onChange={(e) => setUserProfile({...userProfile, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={userProfile.department} onValueChange={(value) => setUserProfile({...userProfile, department: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Current Role</div>
                  <div className="text-sm text-muted-foreground">Facilities Administrator</div>
                </div>
                <Badge variant="secondary">Admin</Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  Two-Factor Authentication
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* District Settings */}
        <TabsContent value="district" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                District Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="districtName">District Name</Label>
                <Input
                  id="districtName"
                  value={districtSettings.districtName}
                  onChange={(e) => setDistrictSettings({...districtSettings, districtName: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">District Address</Label>
                <Input
                  id="address"
                  value={districtSettings.address}
                  onChange={(e) => setDistrictSettings({...districtSettings, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
                  <Select value={districtSettings.fiscalYearStart} onValueChange={(value) => setDistrictSettings({...districtSettings, fiscalYearStart: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">January</SelectItem>
                      <SelectItem value="07">July</SelectItem>
                      <SelectItem value="09">September</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select value={districtSettings.timeZone} onValueChange={(value) => setDistrictSettings({...districtSettings, timeZone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        

        {/* Map Settings */}
        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Map Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
  
              <div className="space-y-4">
                {[
                  { key: 'showPropertyLines', label: 'Show Property Lines', description: 'Display property boundaries on the map' },
                  { key: 'showDistrictBoundary', label: 'Show District Boundary', description: 'Highlight the school district boundaries' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{setting.label}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <Switch
                      checked={mapSettings[setting.key as keyof typeof mapSettings] as boolean}
                      onCheckedChange={(checked) => 
                        setMapSettings({...mapSettings, [setting.key]: checked})
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={currentTheme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="brand">District Branding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}