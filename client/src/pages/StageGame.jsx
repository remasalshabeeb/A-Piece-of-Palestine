
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExtensionIcon from '@mui/icons-material/Extension';
import API from '../api';
import PuzzleBoard from "../components/PuzzleBoard";

const COLORS = {
  green: '#2D5A27',
  red: '#C84B31',
  gold: '#D4AF37',
  cream: '#FDFBF7',
  text: '#2C3E35',
  muted: '#8C9A92',
};
const getStageImageUrl = (image) => {
  if (!image) return '';

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  const baseURL = API.defaults.baseURL.replace(/\/api\/?$/, '');
  const imagePath = image.startsWith('/') ? image : `/${image}`;

  return `${baseURL}${imagePath}`;
};

function getResponseList(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
}

function getId(value) {
  if (value && typeof value === 'object') {
    return String(value._id || value.id || '');
  }
  return String(value || '');
}

export default function StageGame() {
  const { stageId } = useParams();
  const navigate = useNavigate();

  const [stage, setStage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex] || null;

  const answeredQuestions = Array.isArray(progress?.answeredQuestions)
    ? progress.answeredQuestions
    : [];

  const collectedPieces = Array.isArray(progress?.collectedPieces)
    ? progress.collectedPieces
    : [];

  const correctQuestionIds = new Set(
    answeredQuestions
      .filter((answer) => answer.isCorrect)
      .map((answer) => getId(answer.questionId))
  );

  const currentQuestionAnswered = currentQuestion
    ? correctQuestionIds.has(getId(currentQuestion._id))
    : false;

  useEffect(() => {
    let cancelled = false;

    async function loadStage() {
      setLoading(true);
      setError('');

      try {
        const [stagesResponse, questionsResponse, progressResponse] =
          await Promise.all([
            API.get('/stages'),
            API.get(`/stages/${stageId}/questions`),
            API.get(`/progress/stages/${stageId}`),
          ]);

        if (cancelled) return;

        const stages = getResponseList(stagesResponse.data, 'stages');
        const foundStage = stages.find(
          (item) => getId(item._id) === String(stageId)
        );

        if (!foundStage) {
          setError(
            'هذه المرحلة غير متاحة حاليًا أو لم يتم اعتمادها بعد.'
          );
          return;
        }

        const stageQuestions = getResponseList(
          questionsResponse.data,
          'questions'
        ).sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        if (stageQuestions.length !== 4) {
          setError(
            'هذه المرحلة غير جاهزة للعب؛ يجب أن تحتوي على أربعة أسئلة.'
          );
          return;
        }

        const progressData = progressResponse.data;
        const playerProgress =
          progressData?.progress &&
          !Array.isArray(progressData.progress)
            ? progressData.progress
            : progressData;

        if (cancelled) return;

        setStage(foundStage);
        setQuestions(stageQuestions);
        setProgress(playerProgress || {});
        setCompleted(Boolean(playerProgress?.isCompleted));

        const answers = Array.isArray(
          playerProgress?.answeredQuestions
        )
          ? playerProgress.answeredQuestions
          : [];

        const firstUnanswered = stageQuestions.findIndex((question) => {
          return !answers.some(
            (answer) =>
              getId(answer.questionId) === getId(question._id) &&
              answer.isCorrect
          );
        });

        setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
      } catch (err) {
        if (cancelled) return;

        if (err.response?.status === 401) {
          setError('انتهت جلسة تسجيل الدخول. سجّلي الدخول مجددًا.');
        } else {
          setError(
            err.response?.data?.message ||
              'تعذر تحميل المرحلة. تأكدي من تشغيل الخادم واعتماد المرحلة.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!stageId) {
      setError('معرّف المرحلة غير موجود.');
      setLoading(false);
      return undefined;
    }

    loadStage();

    return () => {
      cancelled = true;
    };
  }, [stageId]);

  async function refreshProgress() {
    const response = await API.get(`/progress/stages/${stageId}`);
    const data = response.data;
    const updatedProgress =
      data?.progress && !Array.isArray(data.progress)
        ? data.progress
        : data;

    setProgress(updatedProgress || {});
    return updatedProgress || {};
  }

  async function handleSubmitAnswer() {
    if (
      !currentQuestion ||
      !selectedAnswer ||
      submitting ||
      currentQuestionAnswered
    ) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    setError('');

    try {
      const response = await API.post('/progress/answers', {
        stageId,
        questionId: currentQuestion._id,
        answer: selectedAnswer,
      });

      const result = response.data || {};
      const isCorrect = Boolean(result.isCorrect);

      setFeedback({
        correct: isCorrect,
        message: isCorrect
          ? 'أحسنتِ! إجابة صحيحة، لقد حصلتِ على قطعة من الحكاية.'
          : 'الإجابة غير صحيحة. حاولي مرة أخرى!',
        points: Number(result.pointsAwarded ?? result.points ?? 0),
      });

      await refreshProgress();

      if (isCorrect) {
        setSelectedAnswer('');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'تعذر إرسال الإجابة. حاولي مرة أخرى.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNextQuestion() {
    if (!currentQuestion || submitting) return;

    setError('');
    setFeedback(null);
    setSelectedAnswer('');

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    setSubmitting(true);

    try {
      await API.patch(`/progress/stages/${stageId}/complete`);
      await refreshProgress();
      setCompleted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'لم تكتمل المرحلة بعد. تأكدي من الإجابة الصحيحة عن الأسئلة الأربعة وجمع القطع.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handlePreviousQuestion() {
    if (currentIndex === 0 || submitting) return;

    setCurrentIndex((index) => index - 1);
    setSelectedAnswer('');
    setFeedback(null);
    setError('');
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: COLORS.cream,
        }}
      >
        <CircularProgress sx={{ color: COLORS.green }} />
      </Box>
    );
  }

  if (!stage) {
    return (
      <Box
        dir="rtl"
        sx={{
          minHeight: '100vh',
          bgcolor: COLORS.cream,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ maxWidth: 520, width: '100%', borderRadius: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || 'تعذر العثور على المرحلة.'}
            </Alert>

            <Button
              variant="contained"
              onClick={() => navigate('/user/dashboard')}
              sx={{ bgcolor: COLORS.green }}
            >
              العودة إلى لوحة المستخدم
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const progressPercent = Math.min(
    100,
    Math.round((collectedPieces.length / 4) * 100)
  );

  return (
  <Box
    dir="rtl"
    sx={{
      minHeight: '100vh',
      position: 'relative',
      isolation: 'isolate',
      overflow: 'hidden',
      bgcolor: COLORS.cream,
      color: COLORS.text,
      px: { xs: 2, md: 5 },
      py: 3,

      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        zIndex: -2,
        backgroundImage: stage.image
          ? `url("${getStageImageUrl(stage.image)}")`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      },

      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        backgroundColor: 'rgba(253, 251, 247, 0.86)',
        pointerEvents: 'none',
      },
    }}
  >
      <Box sx={{ maxWidth: 950, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/user/stages/${stageId}/intro`)}
          sx={{ color: COLORS.green, mb: 2 }}
        >
          العودة إلى رحلتي
        </Button>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ color: COLORS.green, fontWeight: 800, mb: 1 }}
          >
            {stage.title}
          </Typography>

          <Typography sx={{ color: COLORS.muted }}>
            {stage.description ||
              'أجيبي عن الأسئلة واجمعي قطع الحكاية الفلسطينية.'}
          </Typography>
        </Box>

        <Card
          sx={{
            borderRadius: 4,
            mb: 3,
            border: `1px solid ${COLORS.gold}55`,
            boxShadow: '0 8px 28px rgba(45, 90, 39, 0.07)',
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={700}>قطع الحكاية</Typography>

              <Chip
                icon={<ExtensionIcon />}
                label={`${collectedPieces.length} من 4`}
                sx={{
                  bgcolor: '#F6EBC8',
                  color: COLORS.green,
                  fontWeight: 700,
                }}
              />
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: '#E8E9DE',
                '& .MuiLinearProgress-bar': {
                  bgcolor: COLORS.green,
                  borderRadius: 5,
                },
              }}
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 1,
                mt: 3,
              }}
            >
              {[0, 1, 2, 3].map((index) => {
                const piece = collectedPieces[index];

                return (
                  <Box
                    key={piece?._id || piece?.pieceId || index}
                    sx={{
                      minHeight: 76,
                      border: `2px dashed ${
                        piece ? COLORS.green : '#D8DCD2'
                      }`,
                      bgcolor: piece ? '#EAF1E5' : '#FFFFFF',
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                    }}
                  >
                    {piece ? (
                      <CheckCircleIcon sx={{ color: COLORS.green }} />
                    ) : (
                      <ExtensionIcon sx={{ color: '#C5CBBF' }} />
                    )}

                    <Typography
                      variant="caption"
                      sx={{
                        color: piece ? COLORS.green : COLORS.muted,
                      }}
                    >
                      {piece ? 'تم الجمع' : `القطعة ${index + 1}`}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {completed ? (
          <Card sx={{ borderRadius: 4, textAlign: 'center', p: 3 }}>
            <CardContent>
              <CheckCircleIcon
                sx={{ fontSize: 72, color: COLORS.green, mb: 2 }}
              />

              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: COLORS.green, mb: 2 }}
              >
                أحسنتِ! أتممتِ المرحلة
              </Typography>

              <Typography sx={{ mb: 3 }}>
                لقد أنهيتِ هذه المرحلة وجمعتِ قطع الحكاية. استعدّي لاكتشاف
                المزيد من فلسطين!
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate('/user/dashboard')}
                sx={{
                  bgcolor: COLORS.green,
                  borderRadius: 3,
                  px: 4,
                  py: 1.3,
                  '&:hover': { bgcolor: '#21451D' },
                }}
              >
                العودة إلى لوحة المستخدم
              </Button>
            </CardContent>
          </Card>
        ) : currentQuestion ? (
          <Card
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 28px rgba(45, 90, 39, 0.08)',
            }}
          >
            <Box sx={{ bgcolor: COLORS.green, color: '#FFFFFF', p: 3 }}>
              <Typography variant="body2" sx={{ opacity: 0.85, mb: 1 }}>
                السؤال {currentIndex + 1} من {questions.length}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {currentQuestion.question}
              </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Stack spacing={1.5}>
                {(currentQuestion.options || []).map((option, index) => {
                  const isSelected = selectedAnswer === option;

                  return (
                    <Button
                      key={`${currentQuestion._id}-${index}`}
                      variant={isSelected ? 'contained' : 'outlined'}
                      disabled={submitting || currentQuestionAnswered}
                      onClick={() => setSelectedAnswer(option)}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'right',
                        whiteSpace: 'normal',
                        minHeight: 56,
                        borderRadius: 3,
                        px: 2,
                        color: isSelected ? '#FFFFFF' : COLORS.text,
                        bgcolor: isSelected ? COLORS.green : '#FFFFFF',
                        borderColor: isSelected
                          ? COLORS.green
                          : '#DCE2D7',
                        '&:hover': {
                          borderColor: COLORS.green,
                          bgcolor: isSelected ? '#21451D' : '#F1F5ED',
                        },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          border: '1px solid currentColor',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          ml: 1.5,
                        }}
                      >
                        {index + 1}
                      </Box>

                      {option}
                    </Button>
                  );
                })}
              </Stack>

              {feedback && (
                <Alert
                  severity={feedback.correct ? 'success' : 'error'}
                  sx={{ mt: 3, borderRadius: 3 }}
                >
                  {feedback.message}
                  {feedback.correct && feedback.points > 0
                    ? ` (+${feedback.points} نقطة)`
                    : ''}
                </Alert>
              )}

              {currentQuestionAnswered && !feedback && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  أجبتِ عن هذا السؤال إجابة صحيحة سابقًا.
                </Alert>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                  mt: 4,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="outlined"
                  disabled={currentIndex === 0 || submitting}
                  onClick={handlePreviousQuestion}
                  sx={{
                    borderColor: COLORS.green,
                    color: COLORS.green,
                    borderRadius: 3,
                  }}
                >
                  السؤال السابق
                </Button>

                {!feedback?.correct && !currentQuestionAnswered ? (
                  <Button
                    variant="contained"
                    disabled={!selectedAnswer || submitting}
                    onClick={handleSubmitAnswer}
                    sx={{
                      bgcolor: COLORS.red,
                      borderRadius: 3,
                      px: 4,
                      '&:hover': { bgcolor: '#A63B26' },
                    }}
                  >
                    {submitting ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : (
                      'تحقق من الإجابة'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    disabled={submitting}
                    onClick={handleNextQuestion}
                    sx={{
                      bgcolor: COLORS.green,
                      borderRadius: 3,
                      px: 4,
                      '&:hover': { bgcolor: '#21451D' },
                    }}
                  >
                    {submitting ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : currentIndex === questions.length - 1 ? (
                      'إنهاء المرحلة'
                    ) : (
                      'السؤال التالي'
                    )}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info">
            لا توجد أسئلة متاحة لهذه المرحلة حاليًا.
          </Alert>
        )}
      </Box>
    </Box>
  );
}
