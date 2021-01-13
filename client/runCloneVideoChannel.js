let isRunCopyVideoChannel = false;
var listChannelV2 = [];
var listVideoChannelV2 = [];

function showLogs(text, color = "darkcyan") {
    $("#logs").append(`<p style="margin: 0px;color: ${color};">${text} - ${new Date().toLocaleString()}</p>`)
}

function run_copy_video_channel() {
    $(".channel_item").each(function () {
        if ($(this).is(":checked")) {
            listChannelV2.push($(this).val())
        }
    });
    if (listChannelV2.length < 1) {
        showAbout("error", "Thông báo", "Chưa chọn channel!");
        return false;
    }
    isRunCopyVideoChannel = true;
    showLogs("Chạy Tải Video Channel ", "red");
    //get list video
    checkVideoDownloadV2();
}


var listVideoChannelItemNeedDownload = [];

// var list

function checkVideoDownloadV2() {
    if (listChannelV2.length < 1) {
        runUploadVideoV2();
        // showAbout("info", "Thông báo", "Đã Chạy Xong!");
        return true;
    }
    let itemChannelRun = listChannelV2[0];
    listChannelV2.splice(0, 1);
    listVideoChannelItemNeedDownload = [];
    listVideoChannelItemNeedDownload = db.get('video').filter({channel_id: itemChannelRun, is_download: false}).value();
    showLogs("Lấy Danh sách video chưa tải về của: " + itemChannelRun);
    if (!listVideoChannelItemNeedDownload || listVideoChannelItemNeedDownload.length < 1) {
        checkVideoDownloadV2();
        return false;
    } else {
        runDownLoadVideo();
    }
    // console.log({listVideoChannelItemNeedDownload})
}

function runDownLoadVideo() {
    if (listVideoChannelItemNeedDownload.length < 1) {
        checkVideoDownloadV2();
        return true;
    }
    let itemDownload = listVideoChannelItemNeedDownload[0];
    // console.log({itemDownload});
    listVideoChannelItemNeedDownload.splice(0, 1);
    showLogs("Bắt đầu tải : " + itemDownload.videoCode);
    ipcRenderer.send("RUN_DOWNLOAD_VIDEO_YOUTUBE_V2", itemDownload)
}

ipcRenderer.on("RESULT_DOWNLOAD_VIDEO_YOUTUBE_V2", async (event, arg) => {
    console.log("RESULT_DOWNLOAD_VIDEO_YOUTUBE_V2", arg);
    showLogs("Tải xong  : " + arg.videoCode);
    if (arg.status) {
        //update is download video true
        db.get('video')
            .find({id: arg.video_id})
            .assign({is_download: true, videoCode: arg.videoCode})
            .write()
    }
    runDownLoadVideo();
});

//upload video in my channel
function runUploadVideoV2() {
    // showLogs("Bắt đầu chạy upload video", "red");
    // $(".channel_item").each(function () {
    //     if ($(this).is(":checked")) {
    //         listChannelV2.push($(this).val())
    //     }
    // });
    let mList = db.get("channel").value()
    mList.forEach(item => {
        listChannelV2.push(item);
    });
    if (listChannelV2.length < 1) {
        showAbout("error", "Thông báo", "Vui lòng thêm lại cookie");
        return false;
    }
    loopGetVideoUploadChannelV2();
}

var listCopyVideo = [];
var loopGetVideoUploadChannelV2 = function () {
    if (listChannelV2.length < 1) {
        showLogs("Dừng Quá Trình Tải và Upload Video!", "red");
        showAbout("info", "Thông báo", "Tất cả video đã được tải lên");
        return false;
    }
    let itemChannelUpload = listChannelV2[0];
    listChannelV2.splice(0, 1);
    listCopyVideo = db.get("video").filter({
        id_upload: false
    }).value();
    if (listCopyVideo.length < 1) {
        loopGetVideoUploadChannelV2();
        return false;
    }
    loopCopyVideoV2().then();
};


var loopCopyVideoV2 = async function () {
    if (listCopyVideo.length < 1) {
        loopGetVideoUploadChannelV2();
        return true;
    }
    let item = listCopyVideo[0];
    listCopyVideo.splice(0, 1);
    let channelInfo = db.get("channel").find({id: item.channel_id}).value();
    showLogs("Bắt đầu upload video !" + item.videoCode);
    ipcRenderer.send("RUN_COPY_VIDEO_CHANNEL", {item, channelInfo})
};

ipcRenderer.on("RESULT_COPY_VIDEO_CHANNEL", async (event, arg) => {
    showLogs("Dừng upload video !" + arg.arg.item.videoCode);
    if (arg.resultUpload.status) {
        db.get('video')
            .find({id: arg.arg.item.id})
            .assign({id_upload: true})
            .write()
    }
    loopCopyVideoV2().then();
});