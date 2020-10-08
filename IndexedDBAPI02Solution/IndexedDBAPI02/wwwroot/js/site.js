window.onload = function ()
{
    // Create constants
    const section = document.querySelector('section');
    const videos = [
        { 'name': 'crystal' },
        { 'name': 'elf' },
        { 'name': 'frog' },
        { 'name': 'monster' },
        { 'name': 'pig' },
        { 'name': 'rabbit' }
    ];

    // Create an instance of a db object for us to store our database in
    let db;

    // Open database; it is created if it doesn't already exist
    // (see onupgradeneeded below)
    let request = window.indexedDB.open('videos_db', 1);

    //#region add event handlers to the request

    request.onerror = function ()
    {
        console.log('Database failed to open');
    };

    request.onsuccess = function ()
    {
        console.log('Database opened succesfully');

        // Store the opened database object in the db variable.
        db = request.result;

        // Question?!?
        // In the following init() function you try to access the IDB.
        // Even so you are in the onsuccess event handler (that confirms opening IDB)
        // you can only access IDB after leaving this event handler?
        // The request you're making in init() will start though (async)
        // but that's(!) onsuccess handler will fire/be called only
        // after leaving this function (here)!?
        init();
        console.log("Init() function left");
    };

    // Setup the database tables if this has not already been done
    request.onupgradeneeded = function (e)
    {

        // Grab a reference to the opened database
        let db = e.target.result;

        // Create an objectStore inside your opened database called videos_os
        // to store your videos in (equivalent to a single table in a conventional db).
        let objectStore = db.createObjectStore('videos_os', { keyPath: 'name' });

        // Create two other indexes (fields).
        objectStore.createIndex('mp4', 'mp4', { unique: false });
        objectStore.createIndex('webm', 'webm', { unique: false });

        console.log('Database setup complete');
    };

    //#endregion

    function init()
    {
        // Loop through the video names
        for (let i = 0; i < videos.length; i++)
        {
            // Open transaction and get object store
            let objectStore = db.transaction('videos_os').objectStore('videos_os');
            let request = objectStore.get(videos[i].name);

            // Where does the success come from..?
            // Check comment at init() - call!
            request.onsuccess = function ()
            {
                // If the result exists in the db (is not undefined)..
                let xx = request.result.mp4.size;
                if (request.result && xx !== 0)
                {
                    // grab and display the videos from IDB
                    console.log('taking videos from IDB');
                    displayVideo(request.result.mp4, request.result.webm, request.result.name);
                }
                else
                {
                    // fetch the videos from the network
                    fetchVideoFromNetwork(videos[i]);
                }
            };
            request.onerror = function ()
            {
                console.log('onerror');
            }
            request.onload = function ()
            {
                console.log('onload');
            }
        }
    }

    // Define the fetchVideoFromNetwork() function
    function fetchVideoFromNetwork(video)
    {
        let a;
        let b;

        console.log('fetching videos from network');
        // Fetch the MP4 and WebM versions of the video using the fetch() function,
        // then expose their response bodies as blobs
        let paramMP4 = '/Index?handler=MP4&videoName=' + video.name;
        let mp4Blob = fetch(paramMP4)/*'Videos/' + video.name + '.mp4'*/
            .then(response => response.blob())
            .then(data => a = data);
        let paramWebm = '/Index?handler=Webm&videoName=' + video.name;
        let webmBlob = fetch(paramWebm)/*'Videos/' + video.name + '.webm'*/
            .then(response => response.blob()
                .then(data => a = data));

        // Only run the next code when both promises have fulfilled
        Promise.all([mp4Blob, webmBlob])
            .then(function (values)
            {
                // display the video fetched from the network with displayVideo()
                displayVideo(values[0], values[1], video.name);
                // store it in the IDB using storeVideo()
                storeVideo(values[0], values[1], video.name);
            });
    }

    // Define the storeVideo() function
    function storeVideo(mp4Blob, webmBlob, name)
    {

        // Open transaction and get object store
        let objectStore = db.transaction(['videos_os'], 'readwrite').objectStore('videos_os');

        // ...
        let request0 = objectStore.delete(name);
        //let request1 = objectStore.delete('1');
        //let request2 = objectStore.delete('2');
        //let request3 = objectStore.delete('3');
        //let request4 = objectStore.delete('4');
        //let request5 = objectStore.delete('5');

        request0.onsuccess = function () { console.log('Item successfully deleted.'); }
        request0.onerror = function () { console.log('Item was not deleted.'); }

        // Create a record to add to the IDB
        let record =
        {
            mp4: mp4Blob,
            webm: webmBlob,
            name: name
        }

        // Add the record to the IDB using add()
        let request = objectStore.add(record);

        request.onsuccess = function ()
        {
            console.log('Record addition attempt finished');
        }

        request.onerror = function ()
        {
            console.log(request.error);
        }

    };

    // Define the displayVideo() function
    function displayVideo(mp4Blob, webmBlob, title)
    {
        // Create object URLs
        // (internal URLs pointing to the video blobs stored in memory)
        let mp4URL = URL.createObjectURL(mp4Blob);
        let webmURL = URL.createObjectURL(webmBlob);

        // Create DOM elements to embed video in the page
        const article = document.createElement('article');
        const h2 = document.createElement('h2');
        h2.textContent = title;
        const video = document.createElement('video');
        video.controls = true;
        const source1 = document.createElement('source');
        source1.src = mp4URL;
        source1.type = 'video/mp4';
        const source2 = document.createElement('source');
        source2.src = webmURL;
        source2.type = 'video/webm';

        // Embed DOM elements into page
        section.appendChild(article);
        article.appendChild(h2);
        article.appendChild(video);
        video.appendChild(source1);
        video.appendChild(source2);
    }
};
