import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Search, Lightbulb, Rocket, BarChart3, Settings } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Search,
      title: "Smart Pain Point Discovery",
      description: "AI-powered scraping of Reddit, TikTok, Quora, and more to find real market problems"
    },
    {
      icon: Lightbulb,
      title: "Intelligent Idea Generation",
      description: "Advanced summarization and classification to turn raw pain points into actionable product ideas"
    },
    {
      icon: Rocket,
      title: "Automated MVP Building",
      description: "Seamless integration with Lovable, Base44, and Replit for rapid prototype development"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track engagement, measure success rates, and optimize your product discovery process"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">IdeaFlow</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary-500 hover:bg-primary-600"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Idea Discovery & 
            <span className="text-primary-500"> MVP Builder</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover trending pain points from social platforms, generate product ideas with AI, 
            and automatically build MVPs. Go from problem to prototype in under 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary-500 hover:bg-primary-600 px-8 py-3"
            >
              Start Building Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary-200 text-primary-700 hover:bg-primary-50 px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Build Successful Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From discovery to deployment, our AI-powered platform handles the entire product development pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              From Pain Point to Prototype
            </h2>
            <p className="text-xl text-gray-600">
              Our streamlined process gets you from idea to MVP faster than ever before.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Discover</h3>
              <p className="text-gray-600">
                AI scrapes social platforms to find real user pain points and trending problems.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Analyze</h3>
              <p className="text-gray-600">
                Advanced AI summarizes and ranks ideas by potential, giving you actionable insights.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Build</h3>
              <p className="text-gray-600">
                Automatically generate MVPs using top platforms like Lovable, Base44, and Replit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build Your Next Big Idea?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of entrepreneurs using IdeaFlow to discover and build successful products.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-white text-primary-500 hover:bg-gray-100 px-8 py-3"
          >
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">IdeaFlow</span>
            </div>
            <div className="text-gray-400">
              © 2024 IdeaFlow. Built for entrepreneurs, by entrepreneurs.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
