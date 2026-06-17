
import { useEffect, useState } from "react";
import { ProgressComponent } from "../../component/progress";


import axios from "axios";

import { Header } from "../../component/Header";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "@/store";
import { addQues } from "@/lib/features/questions/questions";
import { ProblemDesc } from "./components/problemdesc";
import { Editor } from "./components/editor";
import { Console } from "./components/console";
import { addTotalQues } from "@/lib/features/totalques/totalques";
import Error from "../error/error";

export const Problem = () => {
  const [loading, setLoading] = useState(true);
  const [datafetched] = useState(false);
  const [errorRoute, setErrorRoute] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams();

  const questionlist = useSelector((state: RootState) => state.queslist.value);
  const dispatch = useDispatch();

  const question = questionlist.find((question) => question.id === Number(id));

  const totalques = useSelector((state: RootState) => state.totalques.value);

  useEffect(() => {

    const fetchtotalques = async () => {
      return new Promise((resolve, reject) => {
        if (!totalques) {
          axios.get(import.meta.env.VITE_BACKEND_URL + `/totalquestions`)
            .then((response) => {
              dispatch(addTotalQues(response.data['total']));
              resolve(response.data['total']);
            })
            .catch((error) => {
              if (axios.isAxiosError(error) && error.response?.status === 429) {
                alert('Too many requests. Please try again later.');
              }
              console.error(error);
              reject(error);
            });
        } else {
          resolve(totalques);
        }
      });
    }
    const checkid = async () => {
      if (Number(id) < 1 || Number(id) > totalques) {
        setErrorRoute(true);
      } else {
        setErrorRoute(false);
        fetchquestion();
      }
    }
    const fetchquestion = async () => {
      if (!question) {
        axios.get(import.meta.env.VITE_BACKEND_URL + `/question/${id}`)
          .then((response) => {
            dispatch(addQues(response.data));
          })
          .catch((error) => {
            console.error(error);
          })
      }
    }

    const runSequence = async () => {
      try {
        await fetchtotalques();
        setLoading(false);
        await checkid();
      } catch (error) {
        console.error('Error in fetching total questions or checking id:', error);
      }
    }

    if (localStorage.getItem("token") == null || localStorage.getItem("username") == null || localStorage.getItem("email") == null || localStorage.getItem("photoURL") == null) {
      navigate("/signin", { replace: true });
    }
    else {
      setLoading(true);
      runSequence();
    }
  }, [id, question, dispatch, totalques, navigate]);

  return (
    <>
      <div className="h-screen w-screen ">
        <Header />
        {loading ? (
          <ProgressComponent datafetched={datafetched} />
        ) : (
          <main className="px-1 flex flex-row w-screen h-[90vh] overflow-auto">
            <menu className="flex flex-col gap-1 px-1 border-[1px] border-black rounded-md my-2 p-1 h-fit min-w-12 w-fit max-w-fit">
              {Array.from({ length: totalques }, (_, i) => i + 1).map((i) => (
                <Link to={`/problem/${i}`} key={i}>
                  <button className={`w-full cursor-pointer rounded-md border-black border-[1px] border-solid ${i === Number(id) ? 'bg-black text-white hover:bg-opacity-80' : 'bg-white text-black hover:bg-gray-200'}`}>
                    {i}
                  </button>
                </Link>
              ))}
            </menu>

            {errorRoute ?
              <Error /> :
              <section className="flex grow">
                <section className="w-1/2 flex flex-col justify-between flex-grow">
                  <ProblemDesc />
                  <Console />
                </section>
                <section className="flex flex-col justify-between w-1/2 flex-grow">
                  <Editor />
                </section>
              </section>}
          </main>
        )}
      </div>
    </>
  );
};
