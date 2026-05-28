import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import { BrowserRouter, Routes, Route } from 'react-router'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HeaderLayout } from './components/HeaderLayout'
import { CreatorLayout } from './components/CreatorLayout'
import { SolverLayout } from './components/SolverLayout'

import { Landing } from './pages/Landing'
import { AuthCallback } from './pages/AuthCallback'
import { TestList } from './pages/TestList'

import { CreateTest } from './pages/creator/CreateTest'
import { EditTest } from './pages/creator/EditTest'

import { TestSeek } from './pages/solver/TestSeek'
import { TestDetailView } from './pages/solver/TestDetailView'
import { PassingTest } from './pages/solver/PassingTest'
import { CompletedTest } from './pages/solver/CompletedTest'
import { TestsHistory } from './pages/solver/TestsHistory'
import { CompletedTestDetail } from './pages/solver/CompletedTestDetail'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path='/auth/callback' element={<AuthCallback />} />

          <Route element={<HeaderLayout />}>
            <Route path="/" element={<Landing />} />

            <Route path="/creator" element={<CreatorLayout />}>
              <Route index element={<TestList />} />
              <Route path="tests/new" element={<CreateTest />} />
              <Route path="tests/:testId/edit" element={<EditTest />} />
            </Route>

            <Route path="/solver" element={<SolverLayout />}>
              <Route index element={<TestSeek />} />
              <Route path="tests/:testId" element={<TestDetailView />} />
              <Route path="tests/:testId/pass" element={<PassingTest />} />
              <Route path="tests/:testId/completed" element={<CompletedTest />} />
              <Route path="history" element={<TestsHistory />} />
              <Route path="history/:attemptId" element={<CompletedTestDetail />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
