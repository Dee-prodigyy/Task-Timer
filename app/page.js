"use client"

import {useState, useEffect, useRef} from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Progress} from "@/components/ui/progress";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
import {Clock, Play, Pause, Square, Trash2, Sun, Moon} from 'lucide-react';  

export default function TaskTimer() {
   const [timerState, setTimerState] = useState({
    isRunning: false,
    timeLeft: 0, 
    totalTime: 0,
    currentTask: "",
  })

  const [taskName, setTaskName] = useState("")
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [completedTasks, setCompletedTasks] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [warningPeriod, setWarningPeriod] = useState(60) // 60 seconds default
  const [isInWarningPeriod, setIsInWarningPeriod] = useState(false)
  const [warningShown, setWarningShown] = useState(false)

  const intervalRef = useRef(null)

  // Calculate progress
  const progress = timerState.totalTime > 0 ? ((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100 : 0

  // Timer logic
  useEffect(() => {
    if (timerState.isRunning && timerState.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }))
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // Timer completed
      if (timerState.timeLeft === 0 && timerState.isRunning) {
        handleTimerComplete()
      }
    }

    // Check for warning period
    if (timerState.timeLeft <= warningPeriod && timerState.timeLeft > 0 && timerState.isRunning) {
      if (!isInWarningPeriod) {
        setIsInWarningPeriod(true)
        setWarningShown(false)
     }

      // Show warning notification once when entering warning period
      if (!warningShown && timerState.timeLeft === warningPeriod) {
        setWarningShown(true)
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Timer Warning!", {
            body: `Only ${formatDuration(warningPeriod)} remaining for ${timerState.currentTask || "your task"}`,
            icon: "/favicon.ico",
          })
        }
      }
    } else {
      setIsInWarningPeriod(false)
      setWarningShown(false)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState.isRunning, timerState.timeLeft, warningPeriod, isInWarningPeriod, warningShown])

  const handleTimerComplete = () => {
    const completedTask = {
      id: Date.now().toString(),
      name: timerState.currentTask || "Unnamed Task",
      duration: timerState.totalTime,
      completedAt: new Date().toISOString(),
      timeSpent: timerState.totalTime,
    }

    setCompletedTasks((prev) => [completedTask, ...prev])
    setTimerState((prev) => ({ ...prev, isRunning: false }))

    // Show notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Timer Complete!", {
        body: `${completedTask.name} session finished!`,
        icon: "/favicon.ico",
      })
    }
  }

    const startTimer = () => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    setTimerState((prev) => ({
      ...prev,
      isRunning: true,
      currentTask: taskName,
    }))
  }

  const pauseTimer = () => {
    setTimerState((prev) => ({ ...prev, isRunning: false }))
  }

  const resetTimer = () => {
    const totalTime = hours * 3600 + minutes * 60 + seconds
    setTimerState({
      isRunning: false,
      timeLeft: totalTime,
      totalTime: totalTime,
      currentTask: taskName,
    })
  }

    const setCustomDuration = () => {
    const totalTime = hours * 3600 + minutes * 60 + seconds
    if (totalTime > 0) {
      setTimerState((prev) => ({
        ...prev,
        timeLeft: totalTime,
        totalTime: totalTime,
        currentTask: taskName,
      }))
    } 
  }

    const deleteTask = (taskId) => {
    setCompletedTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const exitFullscreen = () => {
    setIsFullscreen(false)
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)

    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Escape" && isFullscreen) {
        exitFullscreen()
      }
      if (event.key === " " && isFullscreen) {
        event.preventDefault()
        if (timerState.isRunning) {
          pauseTimer()
        } else {
          startTimer()
        }
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [isFullscreen, timerState.isRunning])

  return (
    <>
      {/* Added CSS for blink animation */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
      `}</style>
      
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-700" : "bg-gray-50"}`}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Timer</h1>
              <p className="text-gray-600 dark:text-gray-400">Stay focused and track your productivity</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)} className="dark:border-gray-700">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timer Section */}
            <div className="lg:col-span-2">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Clock className="h-5 w-5" />
                    Current Session
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    {timerState.currentTask || "No task selected"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timer Display */}
                  <div className="text-center">
                    <div
                      className={`text-6xl font-mono font-bold mb-4 transition-colors duration-500 ${
                        isInWarningPeriod
                          ? "text-red-600 dark:text-red-400 animate-blink"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {formatTime(timerState.timeLeft)}
                    </div>
                    <Progress
                      value={progress}
                      className={`w-full h-2 mb-4 transition-colors duration-500 ${
                        isInWarningPeriod ? "[&>div]:bg-red-500" : ""
                      }`}
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(timerState.totalTime - timerState.timeLeft)} of{" "}
                      {formatDuration(timerState.totalTime)}
                    </div>
                    {isInWarningPeriod && (
                      <div className="mt-2 text-red-600 dark:text-red-400 font-semibold animate-pulse">
                        ⚠️ Warning: {formatTime(timerState.timeLeft)} remaining!
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center gap-4 flex-wrap">
                    {!timerState.isRunning ? (
                      <Button onClick={startTimer} size="lg" className="px-8">
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </Button>
                    ) : (
                      <Button onClick={pauseTimer} variant="secondary" size="lg" className="px-8">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button onClick={resetTimer} variant="outline" size="lg" className="px-8 bg-transparent">
                      <Square className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button onClick={toggleFullscreen} variant="outline" size="lg" className="px-8 bg-transparent">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      Fullscreen
                    </Button>
                  </div>

                  <Separator className="dark:bg-gray-700" />

                  {/* Task Setup */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="taskName" className="dark:text-white">
                        Task Name
                      </Label>
                      <Input
                        id="taskName"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="Enter task name..."
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <Label className="dark:text-white">Duration</Label>
                      <div className="flex gap-2 mt-2">
                        <div className="flex-1">
                          <Label htmlFor="hours" className="text-xs text-gray-600 dark:text-gray-400">
                            Hours
                          </Label>
                          <Input
                            id="hours"
                            type="number"
                            min="0"
                            max="23"
                            value={hours}
                            onChange={(e) => setHours(Number.parseInt(e.target.value) ||"")}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="minutes" className="text-xs text-gray-600 dark:text-gray-400">
                            Minutes
                          </Label>
                          <Input
                            id="minutes"
                            type="number"
                            min="0"
                            max="59"
                            value={minutes}
                            onChange={(e) => setMinutes(Number.parseInt(e.target.value) ||"")}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="seconds" className="text-xs text-gray-600 dark:text-gray-400">
                            Seconds
                          </Label>
                          <Input
                            id="seconds"
                            type="number"
                            min="0"
                            max="59"
                            value={seconds}
                            onChange={(e) => setSeconds(Number.parseInt(e.target.value) || "")}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                      <Button onClick={setCustomDuration} variant="outline" className="hover:cursor-pointer hover:bg-slate-800 hover:text-white w-full mt-2 bg-transparent">
                        Set Duration
                      </Button>
                    </div>
                    <div>
                      <Label className="dark:text-white">Warning Period</Label>
                      <div className="flex gap-2 mt-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="3600"
                            value={warningPeriod}
                            onChange={(e) => setWarningPeriod(Number.parseInt(e.target.value) || 0)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Seconds"
                          />
                        </div>
                        <div className="flex items-end">
                          <span className="text-sm text-gray-600 dark:text-gray-400 mb-2">seconds before end</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Timer will turn red and show warning when this time remains
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Completed Tasks */}
            <div>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Completed Tasks</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    {completedTasks.length} tasks completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {completedTasks.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">No completed tasks yet</p>
                    ) : (
                      completedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{task.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {formatDuration(task.duration)}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(task.completedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Fullscreen Timer Overlay */}
          {isFullscreen && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-100 flex items-center justify-center">
              <div className="text-center text-white p-8 max-w-4xl w-full">
                {/* Close button */}
                <button
                  onClick={exitFullscreen}
                  className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
                >
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Task name */}
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-300 mb-2">Current Task</h2>
                  <h1 className="text-4xl font-bold">{timerState.currentTask || "Unnamed Task"}</h1>
                </div>

                {/* Large timer display */}
                <div className="mb-12">
                  <div
                    className={`text-9xl md:text-[12rem] font-mono font-bold leading-none mb-8 transition-colors duration-500 ${
                      isInWarningPeriod ? "text-red-400 animate-blink" : "text-white"
                    }`}
                  >
                    {formatTime(timerState.timeLeft)}
                  </div>

                  {/* Progress bar */}
                  <div className="max-w-2xl mx-auto mb-6">
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className={`rounded-full h-3 transition-all duration-1000 ease-out ${
                          isInWarningPeriod ? "bg-red-400" : "bg-white"
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-xl text-gray-300">
                    {formatDuration(timerState.totalTime - timerState.timeLeft)} of {formatDuration(timerState.totalTime)}
                  </div>

                  {isInWarningPeriod && (
                    <div className="mt-4 text-2xl text-red-400 font-bold animate-pulse">
                      ⚠️ WARNING: {formatTime(timerState.timeLeft)} REMAINING!
                    </div>
                  )}
                </div>

                {/* Large control buttons */}
                <div className="flex justify-center gap-8">
                  {!timerState.isRunning ? (
                    <button
                      onClick={startTimer}
                      className="flex items-center justify-center w-24 h-24 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors shadow-2xl"
                    >
                      <svg className="h-12 w-12 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="flex items-center justify-center w-24 h-24 bg-yellow-600 hover:bg-yellow-700 rounded-full text-white transition-colors shadow-2xl"
                    >
                      <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={resetTimer}
                    className="flex items-center justify-center w-24 h-24 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors shadow-2xl"
                  >
                    <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    </svg>
                  </button>
                </div>

                {/* Keyboard shortcuts hint */}
                <div className="mt-12 text-gray-400 text-sm">
                  Press <kbd className="px-2 py-1 bg-gray-700 rounded">ESC</kbd> to exit fullscreen •{" "}
                  <kbd className="px-2 py-1 bg-gray-700 rounded">SPACE</kbd> to play/pause
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}