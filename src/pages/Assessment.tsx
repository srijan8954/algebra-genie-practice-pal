
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Brain, Loader2 } from 'lucide-react';

const Assessment = () => {
  const { user } = useAuth();
  const { setLevel } = useStudent();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const assessmentQuestions = [
    {
      question: "Solve for x: x + 5 = 12",
      options: ["x = 7", "x = 17", "x = 6", "x = 8"],
      correct: "x = 7",
      level: 1
    },
    {
      question: "Simplify: 3x + 2x",
      options: ["5x", "6x", "5x²", "3x + 2x"],
      correct: "5x",
      level: 2
    },
    {
      question: "Solve for y: 2y - 6 = 14",
      options: ["y = 10", "y = 4", "y = 8", "y = 20"],
      correct: "y = 10",
      level: 3
    },
    {
      question: "What is the coefficient of x in 7x + 3?",
      options: ["7", "3", "x", "10"],
      correct: "7",
      level: 2
    },
    {
      question: "Solve: 3(x + 2) = 15",
      options: ["x = 3", "x = 5", "x = 2", "x = 4"],
      correct: "x = 3",
      level: 4
    }
  ];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (selectedAnswer === assessmentQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      completeAssessment();
    }
  };

  const completeAssessment = () => {
    const percentage = (score / assessmentQuestions.length) * 100;
    let level = 1;
    
    if (percentage >= 80) level = 5;
    else if (percentage >= 60) level = 4;
    else if (percentage >= 40) level = 3;
    else if (percentage >= 20) level = 2;

    setLevel(level);
    setIsComplete(true);

    toast({
      title: "Assessment Complete!",
      description: `You scored ${score}/${assessmentQuestions.length}. Starting at level ${level}.`,
    });
  };

  const handleStartLearning = () => {
    navigate('/dashboard');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (isComplete) {
    const percentage = (score / assessmentQuestions.length) * 100;
    const level = percentage >= 80 ? 5 : percentage >= 60 ? 4 : percentage >= 40 ? 3 : percentage >= 20 ? 2 : 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
            <CardDescription>
              Great job! We've determined your starting level.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                Level {level}
              </div>
              <div className="text-lg text-gray-700 mb-2">
                Score: {score}/{assessmentQuestions.length} ({percentage.toFixed(0)}%)
              </div>
              <div className="text-sm text-gray-600">
                {level <= 2 && "Starting with basic equations and variables"}
                {level === 3 && "You have a good foundation! Moving to intermediate problems"}
                {level === 4 && "Well done! Ready for more challenging algebra"}
                {level === 5 && "Excellent! You'll start with advanced problems"}
              </div>
            </div>
            <Button 
              onClick={handleStartLearning}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              size="lg"
            >
              Start Learning Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-700">Initial Assessment</span>
            </div>
            <span className="text-sm text-gray-500">
              {currentQuestion + 1} of {assessmentQuestions.length}
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-xl">
            {assessmentQuestions[currentQuestion].question}
          </CardTitle>
          <CardDescription>
            Choose the correct answer to help us determine your level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            {assessmentQuestions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {currentQuestion < assessmentQuestions.length - 1 ? 'Next Question' : 'Complete Assessment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assessment;
