import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';

interface Chapter {
  _id: string;
  chapterNumber: number;
  title: string;
}

interface QuizFormData {
  title: string;
  description: string;
  chapters: string[];
  questionCount: number;
}

const QuizCreator: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quizLink, setQuizLink] = useState<string | null>(null);
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<QuizFormData>({
    defaultValues: {
      title: '',
      description: '',
      chapters: [],
      questionCount: 10
    }
  });

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/v1/chapters');
        setChapters(response.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch chapters. Please try again later.');
        console.error('Error fetching chapters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  const onSubmit = async (data: QuizFormData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/v1/quizzes', data);
      setQuizLink(response.data.data.shareableLink);
      setError(null);
    } catch (err) {
      setError('Failed to create quiz. Please try again later.');
      console.error('Error creating quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && chapters.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error && chapters.length === 0) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create a New Quiz</h1>
      
      {quizLink ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Quiz created successfully!</p>
          <p>Share this link with your students:</p>
          <div className="flex items-center mt-2">
            <input 
              type="text" 
              value={quizLink} 
              readOnly 
              className="flex-grow p-2 border rounded-l"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(quizLink);
                alert('Link copied to clipboard!');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
          <button 
            onClick={() => setQuizLink(null)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Another Quiz
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full p-2 border rounded"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Chapters
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`chapter-${chapter._id}`}
                    value={chapter._id}
                    {...register('chapters', { required: 'Select at least one chapter' })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor={`chapter-${chapter._id}`} className="ml-2 block text-sm text-gray-900">
                    Chapter {chapter.chapterNumber}: {chapter.title}
                  </label>
                </div>
              ))}
            </div>
            {errors.chapters && (
              <p className="text-red-500 text-sm mt-1">{errors.chapters.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Questions
            </label>
            <Controller
              name="questionCount"
              control={control}
              rules={{ required: 'Number of questions is required', min: { value: 1, message: 'Minimum 1 question' } }}
              render={({ field }) => (
                <input
                  id="questionCount"
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              )}
            />
            {errors.questionCount && (
              <p className="text-red-500 text-sm mt-1">{errors.questionCount.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating Quiz...' : 'Generate Quiz'}
          </button>
        </form>
      )}
    </div>
  );
};

export default QuizCreator; 