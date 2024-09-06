'use client'

import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toast } from "@/components/ui/toast"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowUpRight } from 'lucide-react'

// To Run : npm run dev

const components = [
  { name: 'Accordion', description: 'A vertically stacked set of interactive headings that each reveal a section of content.' },
  { name: 'Alert', description: 'Displays a callout for user attention.' },
  { name: 'Alert Dialog', description: 'A modal dialog that interrupts the user with important content and expects a response.' },
  { name: 'Aspect Ratio', description: 'Displays content within a desired ratio.' },
  { name: 'Avatar', description: 'An image element with a fallback for representing the user.' },
  { name: 'Badge', description: 'Displays a badge or a component that looks like a badge.' },
  { name: 'Button', description: 'Displays a button or a component that looks like a button.' },
  { name: 'Calendar', description: 'A date field component that allows users to enter and edit date.' },
  { name: 'Card', description: 'Displays a card with header, content, and footer.' },
  { name: 'Checkbox', description: 'A control that allows the user to toggle between checked and not checked.' },
  { name: 'Collapsible', description: 'An interactive component which expands/collapses a panel.' },
  { name: 'Command', description: 'Fast, composable, unstyled command menu for React.' },
  { name: 'Context Menu', description: 'Displays a menu to the user — such as a set of actions or functions — triggered by a button.' },
  { name: 'Dialog', description: 'A window overlaid on either the primary window or another dialog window, rendering the content underneath inert.' },
  { name: 'Dropdown Menu', description: 'Displays a menu to the user — such as a set of actions or functions — triggered by a button.' },
  { name: 'Hover Card', description: 'For sighted users to preview content available behind a link.' },
  { name: 'Input', description: 'Displays a form input field or a component that looks like an input field.' },
  { name: 'Label', description: 'Renders an accessible label associated with controls.' },
  { name: 'Menubar', description: 'A horizontal menu bar with clickable menu items.' },
  { name: 'Navigation Menu', description: 'A collection of links for navigating websites.' },
  { name: 'Popover', description: 'Displays rich content in a portal, triggered by a button.' },
  { name: 'Progress', description: 'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.' },
  { name: 'Radio Group', description: 'A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.' },
  { name: 'Scroll Area', description: 'Augments native scroll functionality for custom, cross-browser styling.' },
  { name: 'Select', description: 'Displays a list of options for the user to pick from—triggered by a button.' },
  { name: 'Separator', description: 'A horizontal or vertical separator with an optional label.' },
  { name: 'Sheet', description: 'Extends the Dialog component to display content that complements the main content of the screen.' },
  { name: 'Skeleton', description: 'Use to show a placeholder while content is loading.' },
  { name: 'Slider', description: 'An input where the user selects a value from within a given range.' },
  { name: 'Switch', description: 'A control that allows the user to toggle between checked and not checked.' },
  { name: 'Table', description: 'A responsive table component.' },
  { name: 'Tabs', description: 'A set of layered sections of content—known as tab panels—that are displayed one at a time.' },
  { name: 'Textarea', description: 'Displays a form textarea or a component that looks like a textarea.' },
  { name: 'Toast', description: 'A succinct message that is displayed temporarily.' },
  { name: 'Toggle', description: 'A two-state button that can be either on or off.' },
  { name: 'Tooltip', description: 'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.' },
]

export default function Component() {
  const [selectedComponent, setSelectedComponent] = useState(components[0])
  const [customization, setCustomization] = useState({
    variant: 'default',
    size: 'default',
    orientation: 'horizontal',
    disabled: false
  })

  const handleCustomizationChange = (key: string, value: string | boolean) => {
    setCustomization(prev => ({ ...prev, [key]: value }))
  }

  const renderCustomizationOptions = () => {
    switch (selectedComponent.name) {
      case 'Button':
        return (
          <>
            <Select value={customization.variant} onValueChange={(value) => handleCustomizationChange('variant', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select variant" />
              </SelectTrigger>
              <SelectContent>
                {['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'].map((variant) => (
                  <SelectItem key={variant} value={variant}>{variant}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={customization.size} onValueChange={(value) => handleCustomizationChange('size', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {['default', 'sm', 'lg'].map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )
      case 'Checkbox':
      case 'Switch':
      case 'Toggle':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled" checked={customization.disabled} onCheckedChange={(checked) => handleCustomizationChange('disabled', checked)} />
            <label htmlFor="disabled">Disabled</label>
          </div>
        )
      case 'Input':
      case 'Textarea':
        return (
          <Select value={customization.size} onValueChange={(value) => handleCustomizationChange('size', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {['default', 'sm', 'lg'].map((size) => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'Badge':
        return (
          <Select value={customization.variant} onValueChange={(value) => handleCustomizationChange('variant', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              {['default', 'secondary', 'destructive', 'outline'].map((variant) => (
                <SelectItem key={variant} value={variant}>{variant}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'Separator':
        return (
          <Select value={customization.orientation} onValueChange={(value) => handleCustomizationChange('orientation', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select orientation" />
            </SelectTrigger>
            <SelectContent>
              {['horizontal', 'vertical'].map((orientation) => (
                <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'Slider':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id="disabled" checked={customization.disabled} onCheckedChange={(checked) => handleCustomizationChange('disabled', checked)} />
            <label htmlFor="disabled">Disabled</label>
          </div>
        )
      default:
        return <p>No customization options available for this component.</p>
    }
  }

  const renderComponentExample = () => {
    switch (selectedComponent.name) {
      case 'Accordion':
        return (
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      case 'Alert':
        return (
          <Alert>
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components to your app using the cli.
            </AlertDescription>
          </Alert>
        )
      case 'Alert Dialog':
        return (
          <AlertDialog>
            <AlertDialogTrigger>Open</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      case 'Aspect Ratio':
        return (
          <AspectRatio ratio={16 / 9}>
            <img src="/placeholder.svg?height=300&width=400" alt="Image" className="rounded-md object-cover" />
          </AspectRatio>
        )
      case 'Avatar':
        return (
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        )
      case 'Badge':
        return (
          <Badge variant={customization.variant as any}>Badge</Badge>
        )
      case 'Button':
        return (
          <Button variant={customization.variant as any} size={customization.size as any}>
            Button
          </Button>
        )
      case 'Calendar':
        return (
          <Calendar />
        )
      case 'Card':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        )
      case 'Checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" disabled={customization.disabled} />
            <label htmlFor="terms">Accept terms and conditions</label>
          </div>
        )
      case 'Collapsible':
        return (
          <Collapsible>
            <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
            <CollapsibleContent>
              Yes. Free to use for personal and commercial projects. No attribution required.
            </CollapsibleContent>
          </Collapsible>
        )
      case 'Command':
        return (
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>
                <CommandItem>Search Emoji</CommandItem>
                <CommandItem>Calculator</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        )
      case 'Context Menu':
        return (
          <ContextMenu>
            <ContextMenuTrigger>Right click here</ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem>Profile</ContextMenuItem>
              <ContextMenuItem>Billing</ContextMenuItem>
              <ContextMenuItem>Team</ContextMenuItem>
              <ContextMenuItem>Subscription</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )
      case 'Dialog':
        return (
          <Dialog>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )
      case 'Dropdown Menu':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>Open</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      case 'Hover Card':
        return (
          <HoverCard>
            <HoverCardTrigger>Hover over me</HoverCardTrigger>
            <HoverCardContent>
              The React Framework – created and maintained by @vercel.
            </HoverCardContent>
          </HoverCard>
        )
      case 'Input':
        return (
          <Input type="email" placeholder="Email" size={customization.size as any} />
        )
      case 'Label':
        return (
          <Label htmlFor="email">Your email address</Label>
        )
      case 'Menubar':
        return (
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>New Window</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Share</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Print</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        )
      case 'Navigation Menu':
        return (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink>Link</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )
      case 'Popover':
        return (
          <Popover>
            <PopoverTrigger>Open popover</PopoverTrigger>
            <PopoverContent>Place content for the popover here.</PopoverContent>
          </Popover>
        )
      case 'Progress':
        return (
          <Progress value={33} />
        )
      case 'Radio Group':
        return (
          <RadioGroup defaultValue="option-one">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-one" id="option-one" />
              <Label htmlFor="option-one">Option One</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="option-two" id="option-two" />
              <Label htmlFor="option-two">Option Two</Label>
            </div>
          </RadioGroup>
        )
      case 'Scroll Area':
        return (
          <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
            Jokester began sneaking into the castle in the middle of the night and leaving
            jokes all over the place: under the king's pillow, in his soup, even in the
            royal toilet. The king was furious, but he couldn't seem to catch the jester.
            Finally, he decided to set a trap. He put a whoopee cushion under his throne
            and waited. When the jester sat down, the king jumped out from behind a
            curtain and shouted, "You're under arrest!" But the jester just looked up and
            said, "I guess you caught me sitting down on the job."
          </ScrollArea>
        )
      case 'Select':
        return (
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectContent>
          </Select>
        )
      case 'Separator':
        return (
          <div className={customization.orientation === 'vertical' ? 'h-[100px] flex items-center' : ''}>
            <Separator orientation={customization.orientation as any} />
          </div>
        )
      case 'Sheet':
        return (
          <Sheet>
            <SheetTrigger>Open</SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Are you sure absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        )
      case 'Skeleton':
        return (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        )
      case 'Slider':
        return (
          <Slider defaultValue={[33]} max={100} step={1} disabled={customization.disabled} />
        )
      case 'Switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" disabled={customization.disabled} />
            <Label htmlFor="airplane-mode">Airplane Mode</Label>
          </div>
        )
      case 'Table':
        return (
          <Table>
            <TableCaption>A list of your recent invoices.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">INV001</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )
      case 'Tabs':
        return (
          <Tabs defaultValue="account" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">Make changes to your account here.</TabsContent>
            <TabsContent value="password">Change your password here.</TabsContent>
          </Tabs>
        )
      case 'Textarea':
        return (
          <Textarea placeholder="Type your message here." />
        )
      case 'Toast':
        return (
          <Toast>
            <div className="grid gap-1">
              <div className="font-medium">Scheduled: Catch up</div>
              <div className="text-sm text-muted-foreground">Friday, February 10, 2023 at 5:57 PM</div>
            </div>
          </Toast>
        )
      case 'Toggle':
        return (
          <Toggle aria-label="Toggle italic" disabled={customization.disabled}>
            <span className="font-italic">I</span>
          </Toggle>
        )
      case 'Tooltip':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>Hover</TooltipTrigger>
              <TooltipContent>
                <p>Add to library</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 overflow-y-auto border-r">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">shadcn Components</h2>
          <ul>
            {components.map((component) => (
              <li key={component.name}>
                <button
                  className={`w-full text-left p-2 hover:bg-gray-100 ${
                    selectedComponent.name === component.name ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => setSelectedComponent(component)}
                >
                  {component.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-1/2 p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{selectedComponent.name}</h2>
        <p className="mb-4">{selectedComponent.description}</p>
        <h3 className="text-xl font-semibold mb-2">Customization</h3>
        <div className="mb-4 space-y-2">
          {renderCustomizationOptions()}
        </div>
        <a
          href={`https://ui.shadcn.com/docs/components/${selectedComponent.name.toLowerCase().replace(' ', '-')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-500 hover:underline mb-4"
        >
          View Documentation
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </a>
        <h3 className="text-xl font-semibold mb-2">Example</h3>
        <div className="p-4 border rounded">
          {renderComponentExample()}
        </div>
      </div>
    </div>
  )
}