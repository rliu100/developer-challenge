import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Book from './components/Book.js';
import { Rate, Select, Row, Col } from 'antd';

function App() {
  const [loadedBooks, setLoadedBooks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([null, null, null, null, null]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [contractAddress, setContractAddress] = useState(null);
  // For reviews
  const [uploadReviewState, setUploadReviewState] = useState("");
  const [currentBook, setCurrentBook] = useState(null);
  // const [stars, setStars] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [deployState, setDeployState] = useState("Deploy");

  useEffect(() => {
    start()
  }, []);

  async function start() {
    const address = await deployContract();
    getAllBooks(address) 
  }

  async function getAllBooks(addr=contractAddress){
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/contract/${addr}/getAllBooks`);
      const {bookList, error} = await res.json();
      if (!res.ok) {
        setErrorMsg(error);
      } else {
        setBooks(bookList);
        setLoadedBooks(true);
      }
    } catch(err) {
      setErrorMsg(err.stack)
    }
    setLoading(false);
  }

  async function deployContract() {
    setLoading(true);
    setErrorMsg(null);
    setDeployState("Deploying...")
    try {
      const res = await fetch('/api/contract', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      });
      const {contractAddress : addr, error} = await res.json();
      if (!res.ok) {
        setErrorMsg(error)
        setDeployState("Error! - Retry Deploy");
      } else {
        setContractAddress(addr);
        setDeployState("Redeploy");
        return addr;
      }
    } catch (err) {
      setErrorMsg(err.stack)
      setDeployState("Error! - Retry Deploy");
    }
    setLoading(false);
  }

  async function uploadBookReview() {
    await reviewBook();
    getAllBooks();

  }

  async function reviewBook() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/contract/${contractAddress}/reviewBook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: currentBook,
          stars: userReview
        })
      });
      const {error} = await res.json();
      if (!res.ok) {
        setErrorMsg(error)
      }
    } catch(err) {
      setErrorMsg(err.stack)
    }
    setLoading(false);
  }

  async function getBook(key, addr=contractAddress) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/contract/${addr}/getBook/${key}`);
      const {book, error} = await res.json();
      console.log("book: ", book);
      if (!res.ok) {
        setErrorMsg(error);
      } else {
        let newBooks = [...books]
        newBooks[key] = book;
        setBooks(newBooks);
        setLoadedBooks(true);
      }
    } catch(err) {
      setErrorMsg(err.stack)
    }
    setLoading(false);
  }

  function handleBookChange(value){
    setCurrentBook(value)
  }

  function handleReviewChange(value){
    console.log("star value: ", value)
    setUserReview(value)
  }

  function createBookList(){
    console.log("books: ", books);
    let allBooks = books.filter(book => book !== null);
    let bookList = allBooks.map(book => {
      return (
        <Col key={book?.id} span={8}>
          <Book 
            title={book?.title} 
            author={book?.author}
            totalStars={book?.totalStars}
            totalReviews={book?.totalReviews} 
            key={book?.id}
            id={book?.id}
          />
        </Col> 
      );
    })

    return (
      <Row gutter={[10, 10]}>
        {bookList}
      </Row>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" aria-busy={loading}/>        
        {loadedBooks && <div>
          <Select
            // defaultValue={0}
            style={{ width: 300 }}
            onChange={handleBookChange}
            options={books.map(book => {
              return {
                value: book.id,
                label: book.title
              }
            })}
          />
          <Rate onChange={handleReviewChange}/>
          <p>
            <button type="button" className="App-button" disabled={loading || !userReview || !currentBook} onClick={uploadBookReview}>Review Book</button>
          </p>
        </div>}
        
        <div>
          {loadedBooks && createBookList()}
        </div>   
        { errorMsg && <pre className="App-error">
          Error: {errorMsg}
        </pre>}
      </header>
    </div>
  );
}

export default App;
