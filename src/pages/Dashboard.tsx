import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ellaLogo from "@/assets/ella-logo.png";
import { Users, Calendar, FileText, Award, LogOut, BarChart } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = async () => {
    try {
      // TODO: Connect to your Node/Express backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Logged out",
          description: "You've been successfully logged out.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "Unable to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stats = [
    { title: "Total Participants", value: "248", icon: Users, color: "text-primary" },
    { title: "Upcoming Events", value: "12", icon: Calendar, color: "text-accent" },
    { title: "Surveys Completed", value: "156", icon: FileText, color: "text-ella-pink" },
    { title: "Milestones Achieved", value: "89", icon: Award, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-ella-cream">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={ellaLogo} alt="Ella Rises Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-xl font-bold text-ella-charcoal">Ella Rises Dashboard</h1>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-ella-charcoal">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="shadow-card border-border/40">
              <CardHeader>
                <CardTitle>Welcome to Ella Rises Admin Dashboard</CardTitle>
                <CardDescription>
                  Manage participants, events, surveys, and track program impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  This dashboard provides comprehensive tools to manage the Ella Rises program. 
                  Track participant progress, coordinate events, analyze survey results, and 
                  measure the impact of your STEAM initiatives.
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => setActiveTab("participants")}>
                    Manage Participants
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("events")}>
                    View Events
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                      <div>
                        <p className="font-medium">New participant registered</p>
                        <p className="text-muted-foreground">Maria Rodriguez joined the program</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent mt-2"></div>
                      <div>
                        <p className="font-medium">Event completed</p>
                        <p className="text-muted-foreground">STEAM Workshop #5 completed successfully</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-ella-pink mt-2"></div>
                      <div>
                        <p className="font-medium">Survey responses received</p>
                        <p className="text-muted-foreground">15 new survey submissions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Mariachi Workshop</p>
                        <p className="text-muted-foreground">Thursday, 3:00 PM</p>
                      </div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        12 registered
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Coding Bootcamp</p>
                        <p className="text-muted-foreground">Saturday, 10:00 AM</p>
                      </div>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                        24 registered
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Leadership Seminar</p>
                        <p className="text-muted-foreground">Next Monday, 4:00 PM</p>
                      </div>
                      <span className="text-xs bg-ella-pink/10 text-ella-pink px-2 py-1 rounded-full">
                        8 registered
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <Card className="shadow-card border-border/40">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Participant Management</CardTitle>
                    <CardDescription>View and manage program participants</CardDescription>
                  </div>
                  <Button>Add Participant</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Connect to your Node backend to display participants</p>
                  <p className="text-sm mt-2">API endpoint: /api/participants</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="shadow-card border-border/40">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Event Management</CardTitle>
                    <CardDescription>Coordinate workshops and STEAM programs</CardDescription>
                  </div>
                  <Button>Create Event</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Connect to your Node backend to display events</p>
                  <p className="text-sm mt-2">API endpoint: /api/events</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-card border-border/40">
              <CardHeader>
                <CardTitle>Program Analytics</CardTitle>
                <CardDescription>Track impact and measure success</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Connect to your Node backend to display analytics</p>
                  <p className="text-sm mt-2">API endpoint: /api/analytics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
