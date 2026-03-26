import React, { useState, useEffect } from "react"
import { usePost } from "../hooks/usePost"
import type { HandleSubmitEvent, TaskData } from '../components/type/submitInterface';

const TASK_URL:string="http://localhost:3000/user/task"

export default function Home(){
  const [taskName, setTaskName] = useState<string>("")
  const [detail, setDetail] = useState<string>("")
  const { execute, responseData, loading, error} = usePost(TASK_URL);

  const handleSubmit = (e: HandleSubmitEvent) => {
    e.preventDefault();
    execute({ taskName, detail } as TaskData);
  }

  useEffect(() => {
    if (responseData){
      try {
        console.log(responseData, loading, error);
      } catch (error) {
        console.log(error);
      }
    }
  }, [responseData])

  return(
    <main>
      <section>
        <h1>Create task</h1>
        <form onSubmit={handleSubmit}>
          <label>Task name:</label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Name your task"
          />
          <label>Detail:</label>
          <input
            type="text"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Enter task details."
          />
          <input type="submit"/>
        </form>
      </section>
    </main>
  )
}