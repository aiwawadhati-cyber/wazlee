package my.digitalsys.wazlee;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import java.io.File;

/** Memainkan azan penuh sebagai servis latar depan, dengan butang Henti. */
public class WzAzanService extends Service {

    static final String ACT_STOP = "my.digitalsys.wazlee.AZAN_STOP";
    private MediaPlayer player;
    private String title = "", body = "";
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACT_STOP.equals(intent.getAction())) {
            finish(true);
            return START_NOT_STICKY;
        }
        WzAzan.ensureChannels(this);
        if (intent != null) {
            title = intent.getStringExtra("title");
            body = intent.getStringExtra("body");
        }
        if (title == null) title = "Wazlee";
        if (body == null) body = "";
        Intent stop = new Intent(this, WzAzanService.class);
        stop.setAction(ACT_STOP);
        PendingIntent stopPi = PendingIntent.getService(this, 301, stop, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        String stopLabel = WzAzan.prefs(this).getString("stopLabel", "Henti");
        Notification n = WzAzan.builder(this, WzAzan.CH_AZAN, title, body)
            .setOngoing(true)
            .setAutoCancel(false)
            .setDeleteIntent(stopPi)
            .addAction(new Notification.Action.Builder(null, stopLabel, stopPi).build())
            .build();
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(WzAzan.NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            else startForeground(WzAzan.NOTIF_ID, n);
        } catch (Exception e) {
            WzAzan.notify(this, title, body, false);
            stopSelf();
            return START_NOT_STICKY;
        }
        String kind = intent == null ? "azan" : intent.getStringExtra("kind");
        File f = WzAzan.playable(this, kind);
        if (f == null) {
            finish(false);
            return START_NOT_STICKY;
        }
        try {
            releasePlayer();
            player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build());
            player.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            player.setDataSource(f.getAbsolutePath());
            player.setOnCompletionListener(mp -> finish(false));
            player.setOnErrorListener((mp, w, x) -> { finish(false); return true; });
            player.prepare();
            player.start();
            handler.postDelayed(() -> finish(false), 8 * 60000L); // had keselamatan 8 minit
        } catch (Exception e) {
            finish(false);
        }
        return START_NOT_STICKY;
    }

    private void releasePlayer() {
        if (player != null) {
            try { player.stop(); } catch (Exception ignored) {}
            try { player.release(); } catch (Exception ignored) {}
            player = null;
        }
    }

    /** Hentikan; tinggalkan notifikasi senyap supaya pengguna masih nampak waktu masuk. */
    private void finish(boolean userStopped) {
        handler.removeCallbacksAndMessages(null);
        releasePlayer();
        try { stopForeground(STOP_FOREGROUND_REMOVE); } catch (Exception ignored) {}
        if (title != null && !title.isEmpty()) WzAzan.notify(this, title, body, true);
        stopSelf();
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        releasePlayer();
        super.onDestroy();
    }
}
