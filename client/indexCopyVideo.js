var isRunCopyVideo = false;
var listCopyVideo = [];

function RunCopyVideo() {
    isRunCopyVideo = true;
    listCopyVideo = db.get("video").filter({id_upload: false}).value();
    if (!listCopyVideo || listCopyVideo.length < 1) {
        showAbout("error", "Thông Báo", "Hiện không có video nào chưa tải!");
        return true;
    }
    $("#runCopyVideo").prop("disabled", true);
    $("#stopCopyVideos").prop("disabled", false);
    $("#runCopyVideo").html(`
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span class="sr-only">Đang Chạy...</span>
    `);
    loopCopyVideo().then();

}

function stopCopyVideo() {
    isRunCopyVideo = false;
    $("#runCopyVideo").prop("disabled", false);
    $("#stopCopyVideos").prop("disabled", true);
    $("#runCopyVideo").html(`
        Chạy Copy Video
    `);
}

var loopCopyVideo = async function () {
    if (listCopyVideo.length < 1) {
        showAbout("error", "Thông Báo", "Hiện không có video nào chưa tải!");
        stopCopyVideo();
        return true;
    }
    if (!isRunCopyVideo) {
        stopCopyVideo();
    }

    let item = listCopyVideo[0];
    listCopyVideo.splice(0, 1);
    let channelInfo = db.get("channel").find({id: item.channel_id}).value();
    ipcRenderer.send("RUN_COPY_VIDEO_CHANNEL", {item, channelInfo})
};


ipcRenderer.on("RESULT_COPY_VIDEO_CHANNEL", async (event, arg) => {
    if (arg.resultUpload.status) {
        db.get('video')
            .find({id: arg.arg.item.id})
            .assign({id_upload: true})
            .write()
    }
    loopCopyVideo().then();
});