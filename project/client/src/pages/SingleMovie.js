import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMovieById } from "../calls/movies";
import { useDispatch } from "react-redux";
import { getDatesByMovie } from "../calls/shows";
import { hideLoading, showLoading } from "../redux/loaderSlice";
import { message, Input, Divider, Row, Col, DatePicker } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import moment from "moment";
import dayjs from "dayjs";
import { getAllTheatresByMovie } from "../calls/shows";

const SingleMovie = () => {
  const params = useParams();
  const [movie, setMovie] = useState();
  const [dates, setDates] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleDate = (date, dateString) => {
    getAllTheatres(date);
    navigate(`/movie/${params.id}?date=${dateString}`);
  };

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await getMovieById(params.id);
      if (response.success) {
        setMovie(response.data);
        console.log(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(hideLoading());
    } catch (err) {
      message.error(err.message);
      dispatch(hideLoading());
    }
  };

  const getDates = async () => {
    try {
      dispatch(showLoading());
      // const response = await getAllTheatresByMovie({ movie: params.id, date });
      const response = await getDatesByMovie({ movie: params.id });
      if (response.success) {
        console.log(response.data);
        setDates(response.data);
        getAllTheatres(dayjs(response.data[0]));
      } else {
        message.error(response.message);
      }
      dispatch(hideLoading());
    } catch (err) {
      message.error(err.message);
      dispatch(hideLoading());
    }
  };

  const getAllTheatres = async (date) => {
    try {
      dispatch(showLoading());
      const response = await getAllTheatresByMovie({ movie: params.id, date: date.format("YYYY-MM-DD") });
      if (response.success) {
        setTheatres(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(hideLoading());
    } catch (err) {
      dispatch(hideLoading());
      message.err(err.message);
    }
  };

  useEffect(() => {
    getData();
    getDates();
  }, []);



  return (
    <>
      <div className="inner-container">
        {movie && (
          <div className="d-flex single-movie-div">
            <div className="flex-Shrink-0 me-3 single-movie-img">
              <img src={movie.poster} width={150} alt="Movie Poster" />
            </div>
            <div className="w-100">
              <h1 className="mt-0">{movie.title}</h1>
              <p className="movie-data">
                Description: <span>{movie.description}</span>
              </p>
              <p className="movie-data">
                Genre: <span>{movie.genre}</span>
              </p>
              <p className="movie-data">
                Release Date:{" "}
                <span>{moment(movie.releaseDate).format("MMM Do YYYY")}</span>
              </p>
              <p className="movie-data">
                Duration: <span>{movie.duration} Minutes</span>
              </p>
              <hr />

              <div className="d-flex flex-column-mob align-items-center mt-3">
                <label className="me-3 flex-shrink-0">Choose the date:</label>
                <DatePicker
                  onChange={handleDate}
                  className="max-width-300 mt-8px-mob"
                  allowClear={false}
                  disabled={dates.length === 0}
                  // disable the date if it's not in the dates array
                  disabledDate={(current) => {
                    let check = dates.find(
                      (date) => dayjs(date).format("YYYY-MM-DD") === current.format("YYYY-MM-DD")
                    );
                    return !check;
                  }}
                  // set the default value to the first date in the dates array
                  defaultValue={dates.length > 0 && dayjs(dates[0])}
                  // set the min and max date to the first and last date in the dates array
                  minDate={dates.length > 0 && dayjs(dates[0])}
                  maxDate={dates.length > 0 && dayjs(dates[dates.length - 1])}
                />
              </div>
            </div>
          </div>
        )}
        {theatres.length === 0 && (
          <div className="pt-3">
            <h2 className="blue-clr">
              Currently, no theatres available for this movie!
            </h2>
          </div>
        )}
        {theatres.length > 0 && (
          <div className="theatre-wrapper mt-3 pt-3">
            <h2>Theatres</h2>
            {theatres.map((theatre) => {
              return (
                <div key={theatre._id}>
                  <Row gutter={24} key={theatre._id}>
                    <Col xs={{ span: 24 }} lg={{ span: 8 }}>
                      <h3>{theatre.name}</h3>
                      <p>{theatre.address}</p>
                    </Col>
                    <Col xs={{ span: 24 }} lg={{ span: 16 }}>
                      <ul className="show-ul">
                        {theatre.shows
                          .sort(
                            (a, b) =>
                              moment(a.time, "HH:mm") - moment(b.time, "HH:mm")
                          )
                          .map((singleShow) => {
                            return (
                              <li
                                key={singleShow._id}
                                onClick={() =>
                                  navigate(`/book-show/${singleShow._id}`)
                                }
                              >
                                {moment(singleShow.time, "HH:mm").format(
                                  "hh:mm A"
                                )}
                              </li>
                            );
                          })}
                      </ul>
                    </Col>
                  </Row>
                  <Divider />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
export default SingleMovie;
