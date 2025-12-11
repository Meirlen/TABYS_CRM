// src/components/Tests.js
import { useState } from 'react';
import { CoursesAPI } from '../api/coursesAPI';

const Tests = ({ courseId, lessonId, tests, onComplete }) => {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testResults, setTestResults] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!tests || tests.length === 0) {
    return <div className="text-center py-6">Тесты для этого урока отсутствуют</div>;
  }

  const currentTest = tests[currentTestIndex];

  const handleAnswerSelect = (testId, answerId, isMultiple) => {
    if (testResults[testId]) return; // Запрещаем менять ответ после отправки

    if (isMultiple) {
      // Для тестов с множественным выбором
      setSelectedAnswers(prev => {
        const current = prev[testId] || [];
        if (current.includes(answerId)) {
          return { ...prev, [testId]: current.filter(id => id !== answerId) };
        } else {
          return { ...prev, [testId]: [...current, answerId] };
        }
      });
    } else {
      // Для тестов с одиночным выбором
      setSelectedAnswers(prev => ({ ...prev, [testId]: [answerId] }));
    }
  };
// Исправленная функция в Tests.js
const submitTestAnswer = async () => {
  const testId = currentTest.id;
  const answers = selectedAnswers[testId] || [];

  if (answers.length === 0) {
    alert('Пожалуйста, выберите хотя бы один ответ');
    return;
  }

  setIsSubmitting(true);
  setError(null);

  try {
    // Отправляем массив ID ответов напрямую
    const response = await CoursesAPI.submitTestAnswers(courseId, testId, answers);

    // Получаем результат
    const result = response.data;
    console.log('Результат теста:', result);

    // Сохраняем результат
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        correct: result.passed,  // Используем passed из ответа сервера
        score: result.score,
        correct_count: result.correct_count,
        incorrect_count: result.incorrect_count,
        total_questions: result.total_questions,
        attempts: result.attempts
      }
    }));

    // Если это последний тест и тест пройден, отмечаем урок как выполненный
    if (currentTestIndex === tests.length - 1 && result.passed) {
      onComplete && onComplete();
    }
  } catch (err) {
    console.error('Ошибка при отправке ответов:', err);
    setError(err.response?.data?.detail || 'Не удалось отправить ответы. Проверьте подключение к серверу.');
  } finally {
    setIsSubmitting(false);
  }
};

  const moveToNextTest = () => {
    if (currentTestIndex < tests.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
    }
  };

  // Определяем тип теста (множественный/одиночный выбор)
  const isMultipleChoice = currentTest.answers.filter(a => a.is_correct).length > 1;
  const currentResult = testResults[currentTest.id];
  const isCorrect = currentResult && currentResult.correct;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4 text-sm text-gray-600">
        Тест {currentTestIndex + 1} из {tests.length}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-xl font-medium mb-4">{currentTest.question}</h3>

        {currentTest.image && (
          <div className="mb-4">
            <img src={currentTest.image} alt="Изображение к тесту" className="max-w-full rounded-lg" />
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">
          {isMultipleChoice ? 'Выберите все правильные ответы' : 'Выберите один правильный ответ'}
        </p>

        <div className="space-y-2">
          {currentTest.answers.map(answer => {
            const isSelected = (selectedAnswers[currentTest.id] || []).includes(answer.id);
            const showResult = !!currentResult;

            let answerClasses = 'border rounded-lg p-3 transition-colors cursor-pointer';

            if (showResult) {
              if (answer.is_correct) {
                answerClasses += ' border-green-500 bg-green-50';
              } else if (isSelected && !answer.is_correct) {
                answerClasses += ' border-red-500 bg-red-50';
              } else {
                answerClasses += ' border-gray-200';
              }
            } else {
              answerClasses += isSelected
                ? ' border-blue-500 bg-blue-50'
                : ' border-gray-200 hover:border-gray-300';
            }

            return (
              <div
                key={answer.id}
                className={answerClasses}
                onClick={() => !showResult && handleAnswerSelect(currentTest.id, answer.id, isMultipleChoice)}
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    {isMultipleChoice ? (
                      <div className={`w-5 h-5 rounded border ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} flex items-center justify-center`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded-full border ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} flex items-center justify-center`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    )}
                  </div>
                  <div>{answer.answer_text}</div>
                </div>
              </div>
            );
          })}
        </div>

 {currentResult && (
  <div className={`mt-4 p-3 rounded-lg ${currentResult.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
    {currentResult.correct
      ? `Правильно! Вы ответили верно. Ваш результат: ${currentResult.score.toFixed(0)}%`
      : `Вы ответили неверно. Ваш результат: ${currentResult.score.toFixed(0)}%. Необходимо набрать не менее 70%.`}
    <p className="mt-2">
      Верных ответов: {currentResult.correct_count} из {currentResult.total_questions}
    </p>
    <p className="text-sm mt-1">
      Попыток выполнено: {currentResult.attempts}
    </p>
  </div>
)}
      </div>

      <div className="flex justify-between">
        {!currentResult ? (
          <button
            onClick={submitTestAnswer}
            disabled={isSubmitting || !selectedAnswers[currentTest.id] || selectedAnswers[currentTest.id].length === 0}
            className={`px-4 py-2 rounded-md font-medium ${
              isSubmitting || !selectedAnswers[currentTest.id] || selectedAnswers[currentTest.id].length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? 'Проверяем...' : 'Проверить ответ'}
          </button>
        ) : (
          <div className="flex">
            {currentTestIndex < tests.length - 1 ? (
              <button
                onClick={moveToNextTest}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Следующий вопрос
              </button>
            ) : (
              <button
                onClick={() => onComplete && onComplete()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Завершить тест
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;