pragma solidity >=0.4.24 <0.6.0;
pragma experimental ABIEncoderV2;

contract bookreviews {

    uint public bookCount;

    uint public reviewCount;

    /**
      * @dev 
      */
    struct Book {
        uint id;
        string title;
        string author;
        uint totalStars;
        uint totalReviews;
    }

    // struct Review {
    //     uint bookId;
    //     address reviewer;
    //     uint stars;
    // }

    mapping(uint => Book) public books;
    
    // mapping(uint => Review) public reviews;
    
    // mapping(address => bool) public players;

    function addBook (string memory name, string memory author) private {
        books[bookCount++] = Book(bookCount, name, author, 0, 0);
    }

    constructor() public {
        // Titles taken from https://www.infoplease.com/culture-entertainment/journalism-literature/top-ten-best-selling-childrens-books-all-time 
        addBook("The Adventures of Pinocchio", "Carlo Collodi");
        addBook("The Lion, the Witch and the Wardrobe", "C. S. Lewis");
        addBook("The Little Prince", "Antoine de Saint-Exupéry");
        addBook("Harry Potter and the Philosopher's Stone", "J. K. Rowling");
        addBook("Alice's Adventures in Wonderland", "Lewis Carroll");
    }

    function reviewBook (uint bookId, uint stars) public {
        require(bookId >=0 && bookId < bookCount);

        // require(!players[msg.sender]);
        // reviews[reviewCount++] = Review(bookId, msg.sender, stars);
        books[bookId].totalStars += stars;
        books[bookId].totalReviews += 1;
        
        emit reviewedBook();
    }

    function getBook(uint key) public view returns (Book memory book){
        return books[key];
    }

    function getAllBooks() public view returns (Book[] memory bookList){
        Book[] memory bookList = new Book[](bookCount);
        for (uint id = 0; id < bookCount; id++) {
            bookList[id] = books[id];
        }
        return bookList;
    }

    event reviewedBook ();
}