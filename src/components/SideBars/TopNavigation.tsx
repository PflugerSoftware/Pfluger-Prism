import { Building2, Settings, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { ImageWithFallback } from "./figma/ImageWithFallback"
import lhisdLogo from "figma:asset/90af14c003521ca688460557d379ca5cc575ca8e.png"
import vermeulensLogo from "figma:asset/9fc8dc01fbf55e2e6ba3c5ea713294874adb1996.png"
import pflugerLogo from "figma:asset/bad6ac52df965b935a650d8a5e41273309a7a7b7.png"

export function TopNavigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Prism Logo */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-gray-100"
            asChild
          >
            <a href="#" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-medium">Prism</span>
            </a>
          </Button>
        </div>

        {/* Center: Partner Organization Logos */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-8 px-4">
            {/* Liberty Hill ISD - Primary Logo */}
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={lhisdLogo}
                alt="Liberty Hill ISD"
                className="h-10 w-10 object-contain"
              />
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900">Liberty Hill ISD</div>
                <div className="text-xs text-gray-600">Facilities Management</div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-8 w-px bg-gray-300 hidden md:block"></div>

            {/* Partner Logos */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={pflugerLogo}
                  alt="Pfluger"
                  className="h-6 object-contain max-w-[80px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={vermeulensLogo}
                  alt="Vermeulens"
                  className="h-5 object-contain max-w-[70px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: User Avatar + Dropdown */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-auto px-2 hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" alt="User" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">John Doe</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">John Doe</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    john.doe@libertyhillisd.org
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}