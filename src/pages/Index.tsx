
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, TrendingUp, Users } from 'lucide-react';
import DemoVideoModal from '@/components/DemoVideoModal';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Problems",
      description: "Personalized algebra problems generated just for you"
    },
    {
      icon: TrendingUp,
      title: "Adaptive Learning",
      description: "Difficulty adjusts based on your performance"
    },
    {
      icon: BookOpen,
      title: "Comprehensive Topics",
      description: "Master equations, variables, and more"
    },
    {
      icon: Users,
      title: "Track Progress",
      description: "See your improvement over time"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-xl font-bold text-gray-800">AlgebraAI</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              Login
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master Algebra with
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> AI-Powered Learning</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Personalized algebra practice that adapts to your learning style. 
            Build confidence with problems designed just for you.
          </p>
          <div className="space-x-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
              Start Learning Free
            </Button>
            <DemoVideoModal
              trigger={
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              }
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-blue-600">10,000+</div>
              <div className="text-gray-600">Problems Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">95%</div>
              <div className="text-gray-600">Student Improvement</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">500+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
