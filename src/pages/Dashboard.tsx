
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Brain, TrendingUp, User, Award, Play, Lightbulb, Target } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { progress } = useStudent();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const loadRecommendations = async () => {
    if (progress.totalProblems === 0) return;
    
    setLoadingRecommendations(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-learning-recommendations', {
        body: {
          currentLevel: progress.currentLevel,
          totalProblems: progress.totalProblems,
          correctAnswers: progress.correctAnswers,
          streakCount: progress.streakCount,
          topicsCompleted: progress.topicsCompleted,
          incorrectTopics: []
        }
      });

      if (error) {
        console.error('Error loading recommendations:', error);
      } else {
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (progress.totalProblems > 0) {
      loadRecommendations();
    }
  }, [user, navigate, progress.totalProblems]);

  if (!user) return null;

  const accuracy = progress.totalProblems > 0 ? (progress.correctAnswers / progress.totalProblems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-xl font-bold text-gray-800">AlgebraAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">{user.name}</span>
            </div>
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">Ready to continue your algebra journey?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.totalProblems}</div>
              <p className="text-xs text-muted-foreground">Total completed</p>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
              <p className="text-xs text-muted-foreground">Overall accuracy</p>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {progress.currentLevel}</div>
              <p className="text-xs text-muted-foreground">Keep improving!</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span>Practice Problems</span>
              </CardTitle>
              <CardDescription>
                Solve AI-generated problems tailored to your level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/practice')}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Learning
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/progress')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span>View Progress</span>
              </CardTitle>
              <CardDescription>
                Track your learning journey and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Detailed Progress
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Topics Completed */}
        {progress.topicsCompleted.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Topics Completed</CardTitle>
              <CardDescription>
                Great job! You've practiced these algebra topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {progress.topicsCompleted.map((topic, index) => (
                  <Badge key={index} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Learning Recommendations */}
        {recommendations && (
          <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Lightbulb className="w-5 h-5" />
                <span>AI Learning Recommendations</span>
              </CardTitle>
              <CardDescription className="text-blue-600">
                Personalized suggestions based on your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    Next Learning Goals
                  </h4>
                  <ul className="space-y-1">
                    {recommendations.nextGoals?.map((goal: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Study Strategies</h4>
                  <ul className="space-y-1">
                    {recommendations.studyStrategies?.map((strategy: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {recommendations.motivation && (
                <div className="mt-4 p-4 bg-white/50 rounded-lg">
                  <p className="text-sm text-gray-800 italic">"{recommendations.motivation}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {loadingRecommendations && progress.totalProblems > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Brain className="w-5 h-5 animate-pulse text-blue-600" />
                <span className="text-gray-600">AI is analyzing your progress...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* First Time User - Assessment CTA */}
        {progress.totalProblems === 0 && (
          <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Take Your Initial Assessment</CardTitle>
              <CardDescription className="text-blue-600">
                Let's determine your starting level with a quick assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/assessment')}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
