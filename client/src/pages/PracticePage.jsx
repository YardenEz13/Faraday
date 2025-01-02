import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Link } from "react-router-dom";

function PracticePage() {
  const practiceTopics = [
    {
      title: "Addition",
      description: "Practice basic addition with numbers",
      link: "/practice/addition"
    },
    {
      title: "Multiplication",
      description: "Practice multiplication tables",
      link: "/practice/multiplication"
    },
    {
      title: "Pythagorean Theorem",
      description: "Practice finding missing sides in right triangles",
      link: "/practice/pythagorean"
    },
    {
      title: "Linear Equations",
      description: "Solve equations with one variable",
      link: "/practice/linear"
    },
    {
      title: "Fractions",
      description: "Practice adding and subtracting fractions",
      link: "/practice/fractions"
    },
    {
      title: "Word Problems",
      description: "Solve real-world math problems",
      link: "/practice/word-problems"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Practice Math</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {practiceTopics.map((topic, index) => (
          <Link to={topic.link} key={index}>
            <Card className="h-full hover:bg-muted transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-xl mb-2">{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default PracticePage;
