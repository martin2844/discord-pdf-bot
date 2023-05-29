document.getElementById('refresh-btn').addEventListener('click', function () {
  // Insert the Bootstrap spinner
  document.getElementById('book-list').innerHTML =
    '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>';

  fetch('api/books/refresh')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // After refreshing, get the updated book list
      return fetch('api/books/all');
    })
    .then((response) => response.json())
    .then((data) => {
      let booksHtml = '';
      data.forEach((book) => {
        var title = book.file.split('/').pop();
        title = title.replace(/[_-]/g, ' '); // replace "_" and "-" with space
        title = title.replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }); // title case

        const date = new Date(book.date);
        const dateOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };

        const formattedDate =
          date.toLocaleDateString('en-GB', dateOptions) +
          ' - ' +
          date.toLocaleTimeString('en-GB', timeOptions);

        booksHtml += `
        <div class="card my-2">
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
              <div class="d-flex align-items-center mb-2">
                            <img src="${
                              book.avatar
                                ? book.avatar
                                : 'https://cdn.discordapp.com/avatars/411155469504217089/8b5b4f2f047b7a6986bdc7e78c306b6e.webp'
                            }" alt="${
          book.name
        }'s avatar" class="img-thumbnail me-2" style="width: 50px; height: 50px;">
                            <p class="card-text mb-0">Contribution by <strong>${
                              book.name
                            }</strong></p>
                        </div> 
            <p class="card-text">${formattedDate}</p>
            <a href="${book.file}" class="btn btn-primary">Download Book</a>
          </div>
        </div>
        `;
      });
      // Replace the spinner with the updated book list
      document.getElementById('book-list').innerHTML = booksHtml;
    })
    .catch((e) => console.log('There was an error: ' + e.message));
});
