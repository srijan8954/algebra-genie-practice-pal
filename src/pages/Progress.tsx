
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Home, TrendingUp, Target, Clock, BookOpen, Brain, Star } from 'lucide-react';

const ProgressPage = () => {
  const { user } = useAuth();
  const { progress } = useStudent();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const accuracy = progress.totalProblems > 0 ? (progress.correctAnswers / progress.totalProblems) * 100 : 0;
  const levelProgress = ((progress.currentLevel - 1) / 9) * 100; // Assuming 10 levels max

  const achievements = [
    { 
      title: "First Steps", 
      description: "Solved your first problem", 
      earned: progress.totalProblems > 0,
      icon: Star 
    },
    { 
      title: "Problem Solver", 
      description: "Solved 10 problems", 
      earned: progress.totalProblems >= 10,
      icon: Brain 
    },
    { 
      title: "Streak Master", 
      description: "Got 5 problems correct in a row", 
      earned: progress.streakCount >= 5,
      icon: Target 
    },
    { 
      title: "Level Up", 
      description: "Reached level 3", 
      earned: progress.currentLevel >= 3,
      icon: TrendingUp 
    },
    { 
      title: "Topic Explorer", 
      description: "Practiced 3 different topics", 
      earned: progress.topicsCompleted.length >= 3,
      icon: BookOpen 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
          <h1 className="text-xl font-semibold">Learning Progress</h1>
          <div></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{progress.currentLevel}</div>
                <Progress value={levelProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {progress.currentLevel < 5 ? 'Beginner' : progress.currentLevel < 8 ? 'Intermediate' : 'Advanced'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
                <BookOpen className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{progress.totalProblems}</div>
                <p className="text-xs text-muted-foreground">
                  {progress.correctAnswers} correct answers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{accuracy.toFixed(1)}%</div>
                <Progress value={accuracy} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{progress.streakCount}</div>
                <p className="text-xs text-muted-foreground">
                  problems in a row
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Progress */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Learning Journey */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Journey</CardTitle>
                <CardDescription>Your progress through different algebra levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                    <div key={level} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        level <= progress.currentLevel 
                          ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {level}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${level <= progress.currentLevel ? 'text-gray-900' : 'text-gray-500'}`}>
                          Level {level}
                        </div>
                        <div className="text-sm text-gray-500">
                          {level <= 2 && "Basic equations and variables"}
                          {level === 3 && "Multi-step equations"}
                          {level === 4 && "Distributive property"}
                          {level === 5 && "Combining like terms"}
                          {level === 6 && "Equations with fractions"}
                          {level === 7 && "Advanced problem solving"}
                          {level === 8 && "Complex expressions"}
                          {level === 9 && "Systems of equations"}
                          {level === 10 && "Advanced algebra mastery"}
                        </div>
                      </div>
                      {level === progress.currentLevel && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                          Current
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Unlock badges as you progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                      achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        <achievement.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                          {achievement.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {achievement.description}
                        </div>
                      </div>
                      {achievement.earned && (
                        <Badge className="bg-green-500 text-white">
                          Earned
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Topics Mastered */}
          {progress.topicsCompleted.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Topics Practiced</CardTitle>
                <CardDescription>
                  Algebra concepts you've worked on
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {progress.topicsCompleted.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
                {progress.topicsCompleted.length < 5 && (
                  <p className="text-sm text-gray-600 mt-4">
                    Keep practicing to unlock more topics!
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/practice')}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              size="lg"
            >
              Continue Practice
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
