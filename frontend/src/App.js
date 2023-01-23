import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Book from './components/Book.js';

import { LoadingOutlined } from '@ant-design/icons';
import { 
  Rate, 
  Select, 
  Row, 
  Col, 
  Spin,
  Button,
  Alert,
  Space,
  Dropdown
} from 'antd';

function App() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  // Books
  const [loadedBooks, setLoadedBooks] = useState(false);
  const [books, setBooks] = useState([null, null, null, null, null]);
  // For reviews
  const [currentBook, setCurrentBook] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [sortMethod, setSortMethod] = useState("ID");

  useEffect(() => {
    getAllBooks() 
  }, []);

  async function getAllBooks(){
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/getAllBooks`);
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

  async function uploadBookReview() {
    await reviewBook();
    getAllBooks();
  }

  async function reviewBook() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/reviewBook`, {
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
      } else {
        console.log("resetting values")
        setCurrentBook(null)
        setUserReview(null)
      }
    } catch(err) {
      setErrorMsg(err.stack)
    }
    setLoading(false);
  }

  async function getBook(key) {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/getBook/${key}`);
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
    // console.log("star value: ", value)
    setUserReview(value)
  }

  function createBookList(){
    let sortedBooks = sortBy(sortMethod);
    console.log("sorted: ", sortedBooks);
    // let sortedBooks = books;
    let allBooks = sortedBooks.filter(book => book !== null);
    let bookList = allBooks.map(book => {
      return (
        <Col key={book?.id} span={6}>
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
      <Row 
        gutter={[10, 10]}
        style={{width: "100%"}}
        // gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}
      >
        {bookList}
      </Row>
    )
  }

  function sortBy(key) {
    const articles = ["a", "an", "the"];
    let sortedBooks = books;
    switch(key){
      case "Rating":
        console.log("rating");
        var rating = (book) => (book.totalReviews > 0 ? book.totalStars/book.totalReviews : 0); 
        sortedBooks = books.sort((a,b)=> {
          return rating(a) > rating(b) ? -1 : 1;
        });
        break;
      case "Title":
        console.log("title");
        var rating = (book) => {
          let title = book.title.trim()
          let firstSpace = title.indexOf(" ");
          if (firstSpace != -1){
            let firstWord = title.substring(0,firstSpace);
            return articles.includes(firstWord.toLowerCase()) ? title.substring(firstSpace+1) : title
          }
          return title;
        }; 
        sortedBooks = books.sort((a,b)=> {
          // console.log("rating(a): ", rating(a));
          // console.log("rating(b): ", rating(b));
          return rating(a) > rating(b) ? 1: -1;
        });
        break;
      case "Author":
        var rating = (book) => {
          let splitName = book.author.split(" ");
          let lastName = splitName[splitName.length -1];
          return lastName;
        }
        sortedBooks = books.sort((a,b)=> {
          console.log("rating(a): ", rating(a));
          console.log("rating(b): ", rating(b));
          return rating(a) > rating(b) ? 1: -1;
        });
        break;
      case "ID":
        break;
    }
    // setBooks(sortedBooks)
    return sortedBooks;
  }

  function handleSortChange(key) {
    setSortMethod(key);
  }

  const spinnerIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  const spinner = <Spin indicator={spinnerIcon} />;
  const logoSpinner = <img src={logo} className="App-logo" alt="logo" aria-busy={loading}/>;

  return (
    <div className="App">
      <header className="App-header">
        <div className="page-title">Rate-a-Book</div>
      </header>
            { errorMsg && (
        <Space direction="vertical" style={{ width: 'auto' }}>
          <Alert 
            message={errorMsg} 
            type="error" 
            closable 
            showIcon
          />
        </Space>          
      )}
      <div>
        {loading && !loadedBooks && spinner}    
        {loadedBooks &&  
          <div>       
            <div className='rating-container'>
              <div className="rating-select-container">
                <Select
                  showSearch
                  value={currentBook}
                  placeholder="Select a book"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) // from antd docs
                  }
                  style={{ width: 300, marginRight: 10 }}
                  onChange={handleBookChange}
                  options={books.map(book => {
                    return {
                      value: book.id,
                      label: book.title
                    }
                  })}
                />
                <Rate value={userReview} onChange={handleReviewChange}/>
              </div>           
              <p>
                <Button
                  type="button" 
                  className="App-button" 
                  loading={loading}
                  disabled={loading || !userReview || !currentBook} 
                  onClick={uploadBookReview}
                >
                  Submit Rating
                </Button>
              </p>
            </div>
            <div className="sort-container">
              <Dropdown 
                menu={{ 
                  items: [
                    {
                      key: 0,
                      label: "Rating",
                      onClick: (e) => {handleSortChange("Rating");}
                    },
                    {
                      key: 1,
                      label: "Title",
                      onClick: (e) => {handleSortChange("Title");}
                    },
                    {
                      key: 2,
                      label: "Author",
                      onClick: (e) => {handleSortChange("Author");}
                    },
                    {
                      key: 3,
                      label: "ID",
                      onClick: (e) => {handleSortChange("ID");}
                    },
                  ]
                }} 
                placement="bottom" 
                arrow 
                trigger={['click']}>
                  <Button className="App-button" onClick={(e) => e.preventDefault()}>Sort By</Button>
              </Dropdown>
            </div>
          </div>
        }
        
        <div className="book-list-container">
          {loadedBooks && 
            <div className="books-list">
              {createBookList()}
            </div>}
        </div>   
      </div>
    </div>
  );
}

export default App;
