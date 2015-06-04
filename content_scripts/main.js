
var $lyricsInputTextArea;
var $currentLineDisplaySpan;

function initializeUI() {
    var $addLyricsBtn = $("<button>Add Lyrics</button>")
        .addClass("lyrical_Btn");
    $addLyricsBtn.insertBefore($("#yt-masthead-user"));

    var $manualSyncBtn = $("<button>Manual Sync</button>")
        .addClass("lyrical_Btn");

    var $submitLyricsBtn = $("<button>Submit Lyrics</button>")
        .addClass("lyrical_Btn");

    var $playWithLyricsBtn = $("<button>Play with Lyrics</button>")
        .addClass("lyrical_Btn");


    $manualSyncBtn.insertAfter($addLyricsBtn);
    $submitLyricsBtn.insertAfter($manualSyncBtn);
    $playWithLyricsBtn.insertAfter($submitLyricsBtn);

    $addLyricsBtn.click(addLyrics);
    $submitLyricsBtn.click(submitLyrics);
    $manualSyncBtn.click(manualSync);
    $playWithLyricsBtn.click(playWithSync);

    $lyricsInputTextArea = $("<textarea>")
        .addClass("lyrical_LyricsInputTextArea")
        .appendTo(document.body)
        .hide();

    $currentLineDisplaySpan = $("<textarea>")
        .addClass("lyrical_CurrentLineDisplay")
        .appendTo(document.body)
        .hide();


}

function addLyrics() {
    $lyricsInputTextArea.show();

}

function submitLyrics() {
    var lyricsText = $lyricsInputTextArea.val();
    var pageUrl = window.location.href;
    var key = pageUrl + '_lyrics';

    var data = {};
    data[key] = lyricsText;

    chrome.storage.sync.set(data, function() {

    });
    $lyricsInputTextArea.hide();
}

function manualSync() {
    var pageUrl = window.location.href;
    var key = pageUrl + '_lyrics';




    chrome.storage.sync.get(key, function(items) {
        console.log(items);
        var lyricsText = items[key];

        var linesArray = lyricsText.match(/[^\r\n]+/g);

        var data = {};

        $currentLineDisplaySpan.val("Press space to begin... when you hear the first line of the song")
        $currentLineDisplaySpan.show();

        var i = 0;


        var onKeyDownSpace = function(e) {

            var code = e.which || e.keyCode;

            if (code === 32) { // Space
                e.stopImmediatePropagation();
                e.preventDefault();

                var currentVideoTime = getCurrentVideoTime();

                var line = linesArray[i];
                data[currentVideoTime] = line;
                i++;

                $currentLineDisplaySpan.val(line);
            }


        }

        document.addEventListener('keydown', onKeyDownSpace, true);

        var interval;
        var checkVideoOver = function () {
            var v1 = getCurrentVideoTime(),
                v2 = Number($(".html5-progress-bar").attr('aria-valuemax'));


            // if video over
            if (v1 >= v2) {
                document.removeEventListener('keydown', onKeyDownSpace, true);
                clearInterval(interval);
                $currentLineDisplaySpan.val("Refresh page to see synced lyrics");

                var key2 = pageUrl + '_syncedLyricsData';

                var data2 = {};
                data2[key2] = data;

                chrome.storage.sync.set(data2, function() {

                });

            }
        }

        interval = setInterval(checkVideoOver, 500);

    });




}

// returns the aria-valuenow value
function getCurrentVideoTime() {
    return Number($(".html5-progress-bar").attr('aria-valuenow'));
}

function playWithSync() {
    var pageUrl = window.location.href;
    var key = pageUrl + '_syncedLyricsData';


    chrome.storage.sync.get(key, function(items) {
        var syncedData = items[key];

        var showSyncedLine = function() {
            var v1 = getCurrentVideoTime(),
                v2 = Number($(".html5-progress-bar").attr('aria-valuemax'));

            for (var key in syncedData) {
                if (syncedData.hasOwnProperty(key)) {
                    if (Number(key) >= v1) {

                        $currentLineDisplaySpan.val(syncedData[key]);
                        $currentLineDisplaySpan.show();
                        break;
                    }
                }
            }

        };

        interval = setInterval(showSyncedLine, 500); // todo: clear interval somewhere?
    });



}

initializeUI();
