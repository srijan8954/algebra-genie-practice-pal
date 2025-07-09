
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Brain, CheckCircle, XCircle, Home, ArrowRight, Coins } from 'lucide-react';

interface Problem {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  topic: string;
}

const Practice = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { progress, updateProgress } = useStudent();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [incorrectTopics, setIncorrectTopics] = useState<string[]>([]);

  // AI-powered problem generation
  const loadNewProblem = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-algebra-problem', {
        body: {
          level: progress.currentLevel,
          recentTopics: progress.topicsCompleted,
          incorrectTopics: incorrectTopics
        }
      });

      if (error) {
        console.error('Error generating problem:', error);
        throw error;
      }

      if (data) {
        setCurrentProblem(data);
        setSelectedAnswer('');
        setShowResult(false);
      }
    } catch (error) {
      console.error('Failed to generate AI problem:', error);
      toast({
        title: "Problem Generation Failed",
        description: "Using a backup problem. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to a simple problem if AI generation fails
      const fallbackProblem = {
        question: `Solve for x: x + 5 = 12`,
        options: ["A) x = 7", "B) x = 8", "C) x = 6", "D) x = 17"],
        correct: "A) x = 7",
        explanation: "To solve x + 5 = 12, subtract 5 from both sides: x = 12 - 5 = 7",
        topic: "Linear Equations"
      };
      setCurrentProblem(fallbackProblem);
      setSelectedAnswer('');
      setShowResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadNewProblem();
  }, [user, navigate]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!currentProblem || !selectedAnswer || !user) return;

    const correct = selectedAnswer === currentProblem.correct;
    setIsCorrect(correct);
    setShowResult(true);
    setSessionCount(sessionCount + 1);
    
    // Track incorrect topics for adaptive learning
    if (!correct && !incorrectTopics.includes(currentProblem.topic)) {
      setIncorrectTopics(prev => [...prev, currentProblem.topic]);
    }
    
    updateProgress(correct, currentProblem.topic);

    if (correct) {
      toast({
        title: "Correct! 🎉",
        description: "Great job! Keep up the good work.",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Don't worry, you'll get the next one!",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    loadNewProblem();
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-8">
          <Brain className="w-12 h-12 mx-auto text-blue-600 animate-pulse mb-4" />
          <h3 className="text-lg font-semibold mb-2">Generating Your Problem...</h3>
          <p className="text-gray-600">AI is creating a personalized problem just for you!</p>
        </Card>
      </div>
    );
  }

  if (!currentProblem) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">Level {progress.currentLevel}</Badge>
            <Badge variant="outline">Session: {sessionCount} problems</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Problem Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                  {currentProblem.topic}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">AI Generated</span>
                </div>
              </div>
              <CardTitle className="text-2xl">
                {currentProblem.question}
              </CardTitle>
              <CardDescription>
                Choose the correct answer from the options below
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showResult ? (
                <>
                  <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                    {currentProblem.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-lg">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="mt-6">
                     <Button 
                       onClick={handleSubmit}
                       disabled={!selectedAnswer}
                       className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                       size="lg"
                     >
                       Submit Answer
                     </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Result */}
                  <div className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <h3 className={`text-lg font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </h3>
                    </div>
                    {!isCorrect && (
                      <p className="text-gray-700 mb-2">
                        The correct answer is: <strong>{currentProblem.correct}</strong>
                      </p>
                    )}
                    <p className="text-gray-700">
                      <strong>Explanation:</strong> {currentProblem.explanation}
                    </p>
                  </div>

                  {/* Next Button */}
                  <Button 
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                    size="lg"
                  >
                    Next Problem <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Stats */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{progress.totalProblems}</div>
                  <div className="text-sm text-gray-600">Total Solved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {progress.totalProblems > 0 ? Math.round((progress.correctAnswers / progress.totalProblems) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{progress.streakCount}</div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Practice;
