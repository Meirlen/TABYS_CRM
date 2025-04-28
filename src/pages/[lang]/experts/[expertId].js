import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import HeaderBack from '../../../components/HeaderBack';
import { translations } from '../../../locales/translations';

export default function ExpertDetailPage({ lang: serverLang, translations: serverTranslations }) {
  const router = useRouter();
  const { lang: clientLang, expertId } = router.query;

  // Use language from server props or from client-side routing
  const [currentLang, setCurrentLang] = useState(serverLang || 'kz');
  // Use translations from server props or from imported file
  const [t, setT] = useState(serverTranslations || {});

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for collaboration request
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    message: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Update language when client navigation changes (if query parameters change)
    if (clientLang && clientLang !== currentLang) {
      const validLang = ['kz', 'ru', 'en'].includes(clientLang) ? clientLang : 'kz';
      setCurrentLang(validLang);

      // Use existing translations
      if (translations && translations[validLang]) {
        setT(translations[validLang]);
      }

      // Save selected language to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', validLang);
      }
    }
  }, [clientLang, currentLang]);

  // Function to get translations from nested keys
  const getTranslation = (key) => {
    try {
      const keys = key.split('.');
      let result = t;

      for (const k of keys) {
        if (!result || result[k] === undefined) {
          console.warn(`Translation missing: ${key}`);
          return key;
        }
        result = result[k];
      }

      return typeof result === 'string' ? result : key;
    } catch (e) {
      console.error(`Error getting translation for key: ${key}`, e);
      return key;
    }
  };

  // Fetch expert details when component mounts or expertId changes
  useEffect(() => {
    const fetchExpertDetails = async () => {
      if (!expertId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/v2/experts/${expertId}`);

        if (response.ok) {
          const data = await response.json();
          setExpert(data);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to fetch expert details');
        }
      } catch (error) {
        setError('Error loading expert details. Please try again.');
        console.error('Error fetching expert details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpertDetails();
  }, [expertId]);

  // Handle input changes for the collaboration form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle collaboration request form submission
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!expertId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/v2/experts/${expertId}/collaborate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          user_name: '',
          user_email: '',
          user_phone: '',
          message: '',
        });
        // Close modal after a delay
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to submit request');
      }
    } catch (error) {
      setError('Error submitting request. Please try again.');
      console.error('Error submitting collaboration request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate back to experts list
  const handleBack = () => {
    router.push(`/${currentLang}/experts`);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <HeaderBack title={getTranslation('expertDetail.title') || 'Expert Profile'} onBack={handleBack} />
        <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !expert) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans">
        <HeaderBack title={getTranslation('expertDetail.title') || 'Expert Profile'} onBack={handleBack} />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {getTranslation('expertDetail.error.title') || 'Error Loading Profile'}
            </h3>
            <p className="text-gray-600">
              {error || getTranslation('expertDetail.error.message') || 'Expert not found or error loading details'}
            </p>
            <button
              onClick={handleBack}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {getTranslation('expertDetail.backToList') || 'Back to Experts List'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>{expert.full_name} | {getTranslation('expertDetail.title') || 'Expert Profile'}</title>
        <meta
          name="description"
          content={`${expert.full_name} - ${expert.specialization}. ${getTranslation('expertDetail.description') || 'View expert profile and request collaboration'}`}
        />
      </Head>

      <HeaderBack
        title={getTranslation('expertDetail.title') || 'Expert Profile'}
        onBack={handleBack}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Expert header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="p-6 pt-0 -mt-16">
            <div className="flex flex-col md:flex-row md:items-end">
              <div className="h-32 w-32 rounded-xl bg-white p-1 shadow-md mb-4 md:mb-0">
                <div className="h-full w-full rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-4xl font-medium text-white">
                  {expert.full_name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="md:ml-6 md:flex-grow">
                <h1 className="text-2xl font-bold text-gray-800">{expert.full_name}</h1>
                <p className="text-blue-600 text-lg">{expert.specialization}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {getTranslation('expertDetail.requestCollaboration') || 'Request Collaboration'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact information */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                {getTranslation('expertDetail.contactInfo') || 'Contact Information'}
              </h2>

              <div className="space-y-4">
                {expert.phone && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-0.5">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        {getTranslation('expertDetail.phone') || 'Phone'}
                      </p>
                      <p className="mt-1 text-gray-900">{expert.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main content - right side */}
          <div className="md:col-span-2 space-y-6">
            {/* Education section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                {getTranslation('expertDetail.education.title') || 'Education'}
              </h2>

              {expert.education && expert.education.length > 0 ? (
                <div className="space-y-6">
                  {expert.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4 ml-2">
                      <div className="flex items-center">
                        <div className="absolute -ml-6 h-4 w-4 rounded-full bg-blue-500"></div>
                        <h3 className="text-base font-medium text-gray-800">{edu.university}</h3>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">{edu.start_year} - {edu.end_year || getTranslation('expertDetail.present') || 'Present'}</p>
                      <p className="text-sm text-gray-600 mt-1">{edu.specialization}</p>
                      {edu.degree && <p className="text-sm text-gray-600"><span className="font-medium">{getTranslation('expertDetail.education.degree') || 'Degree'}:</span> {edu.degree}</p>}

                      {edu.certificates && edu.certificates.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">{getTranslation('expertDetail.education.certificates') || 'Certificates'}</p>
                          <ul className="mt-2 space-y-1">
                            {edu.certificates.map((cert, certIndex) => (
                              <li key={certIndex} className="text-sm text-gray-600 flex items-start">
                                <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {cert.name} {cert.year && `(${cert.year})`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  {getTranslation('expertDetail.education.noData') || 'No education information available'}
                </p>
              )}
            </div>

            {/* Work Experience section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                {getTranslation('expertDetail.experience.title') || 'Work Experience'}
              </h2>

              {expert.experience && expert.experience.length > 0 ? (
                <div className="space-y-6">
                  {expert.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4 ml-2">
                      <div className="flex items-center">
                        <div className="absolute -ml-6 h-4 w-4 rounded-full bg-blue-500"></div>
                        <h3 className="text-base font-medium text-gray-800">{exp.company}</h3>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">{exp.position}</p>
                      <p className="text-sm text-gray-500 mt-1">{exp.start_year} - {exp.end_year || getTranslation('expertDetail.present') || 'Present'}</p>

                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-3">{exp.description}</p>
                      )}

                      {exp.projects && exp.projects.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">{getTranslation('expertDetail.experience.projects') || 'Projects'}</p>
                          <ul className="mt-2 space-y-1">
                            {exp.projects.map((project, projectIndex) => (
                              <li key={projectIndex} className="text-sm text-gray-600 flex items-start">
                                <svg className="h-4 w-4 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {project}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  {getTranslation('expertDetail.experience.noData') || 'No work experience information available'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {getTranslation('expertDetail.collaboration.title') || 'Request Collaboration'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {submitSuccess ? (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg font-medium text-gray-900">
                  {getTranslation('expertDetail.collaboration.success.title') || 'Request Submitted!'}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {getTranslation('expertDetail.collaboration.success.message') || 'Your collaboration request has been sent successfully. You will receive an email notification when the expert responds.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('expertDetail.collaboration.name') || 'Your Name'}*
                  </label>
                  <input
                    type="text"
                    id="user_name"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('expertDetail.collaboration.email') || 'Your Email'}*
                  </label>
                  <input
                    type="email"
                    id="user_email"
                    name="user_email"
                    value={formData.user_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="user_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('expertDetail.collaboration.phone') || 'Your Phone'}
                  </label>
                  <input
                    type="tel"
                    id="user_phone"
                    name="user_phone"
                    value={formData.user_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {getTranslation('expertDetail.collaboration.message') || 'Message'}*
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder={getTranslation('expertDetail.collaboration.messagePlaceholder') || 'Describe your project or request...'}
                  ></textarea>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {getTranslation('expertDetail.collaboration.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {getTranslation('expertDetail.collaboration.submitting') || 'Submitting...'}
                      </>
                    ) : (
                      getTranslation('expertDetail.collaboration.submit') || 'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

                {expert.email && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-0.5">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        {getTranslation('expertDetail.email') || 'Email'}
                      </p>
                      <p className="mt-1 text-gray-900">{expert.email}</p>
                    </div>
                  </div>
                )}

                {expert.website && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-0.5">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        {getTranslation('expertDetail.website') || 'Website'}
                      </p>
                      <p className="mt-1 text-gray-900">
                        <a href={expert.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {expert.website.replace(/^https?:\/\//, '')}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {expert.city && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 text-blue-500 mt-0.5">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        {getTranslation('expertDetail.location') || 'Location'}
                      </p>
                      <p className="mt-1 text-gray-900">{expert.city}{expert.address ? `, ${expert.address}` : ''}</p>
                    </div>
                  </div>
                )}