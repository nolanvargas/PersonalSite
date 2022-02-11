const APIController = (function() {

    const clientID = '';
    const clientSecret = '';

    //private methods
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(clientID + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        console.log(data.access_token);
        return data.access_token;
    }

    const _getGenres = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`,{
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
    
        const data = await result.json();
        return data.categories.items;
    }
    
    const _getPlaylistByGenre = async (token, genreId) => {
        
        const limit = 10;
    
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
    
        const data = await result.json();
        return data.playlists.items;
    }
    
    const _getTracks = async (token, tracksEndPoint) => {
        
        const limit = 10;
    
        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
    
        const data = await result.json();
        return data.items;
    }
    
    const _getTrack = async (token, trackEndPoint) => {
        
        const limit = 10;
    
        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
    
        const data = await result.json();
        return data;
    }
    
    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }
})();

//UI module
const UIController = (function() {

    //object to hold refrences to html selectors
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSongList: '.song-list'
    }

    //public methods
    return {

        //method to get inout fields
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                songs: document.querySelector(DOMElements.divSongList),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },

        //need methods to create select list option
        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        },

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        //need method to createa track list group item
        createTrack(id, name) {
            const html = `<a href="#" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSongList).insertAdjacentHTML('beforeend', html);
        },

        //need method to create the song detail
        createSongDetail(img, title, artist) {

            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            //any time user clicks a new song, we need to clear out the song deatil div
            detailDiv.innerHTML = '';

            const html = 
            `
            <div>
                <img src="${img}" alt="">
            </div>
            <div>
                <label for="Genre">${title}:</label>
            </div>
            <div>
                <label for="artist">By ${artist}:</label>
            </div>`;

            detailDiv.insertAdjacentHTML('beforeend', html)
        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().songs.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylsit() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        }
    }
})();

const APPController = (function(UICtrl, APICtrl) {

    //get input field object ref
    const DOMInputs = UICtrl.inputField();

    //get genres on page load
    const loadGenres = async () => {
        //get the token
        const token = await APICtrl.getToken();
        //get the genres
        const genres = await APICtrl.getGenres(token);
        //populate our genres select element0
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    //create genre change event listener
    DOMInputs.genre.addEventListener('change', async () => {

        //when the user changes genres, we need to reset the subsequent feilds
        UICtrl.resetPlaylsit();
        //get the token. add method to store the token on the pae so we dont have to keep hitting the api for the token
        const token = UICtrl.getStoredToken().token;
        //get the genre select field
        const genreSelect = UICtrl.inputField().genre;
        //get the selected genreId
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;
        //get the playlist data from spotify based on the genre
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
        //load the playlist select field
        console.log(playlist);

    });

    DOMInputs.submit.addEventListener('click', async (e) => {
        e.preventDefault();

    });

    DOMInputs.songs.addEventListener('click', async (e) => {
        e.preventDefault();

    });
})();