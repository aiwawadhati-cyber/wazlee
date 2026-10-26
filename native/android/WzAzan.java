package my.digitalsys.wazlee;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import java.io.File;
import org.json.JSONArray;
import org.json.JSONObject;

/** Penjadualan & bunyi azan penuh (fail pilihan pengguna). */
public final class WzAzan {

    static final String PREFS = "wz_azan";
    static final String ACT_FIRE = "my.digitalsys.wazlee.AZAN_FIRE";
    static final String CH_AZAN = "wz_azan";
    static final String CH_WAKTU = "wz_waktu";
    static final String CH_INFO = "wz_info";
    static final int NOTIF_ID = 7700;

    private WzAzan() {}

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static File file(Context c, String kind) {
        return new File(c.getFilesDir(), "subuh".equals(kind) ? "azan_subuh.audio" : "azan_main.audio");
    }

    /** Fail yang akan dimainkan untuk jenis ini (Subuh guna fail utama jika tiada fail Subuh). */
    static File playable(Context c, String kind) {
        File f = file(c, kind);
        if (f.exists() && f.length() > 0) return f;
        File m = file(c, "azan");
        if (m.exists() && m.length() > 0) return m;
        return builtin(c, kind);
    }

    /** Azan terbina dalam APK (res/raw/azan, res/raw/azan_subuh) — disalin ke storan dalaman sekali. */
    static int builtinId(Context c, String kind) {
        int id = 0;
        if ("subuh".equals(kind)) id = c.getResources().getIdentifier("azan_subuh", "raw", c.getPackageName());
        if (id == 0) id = c.getResources().getIdentifier("azan", "raw", c.getPackageName());
        return id;
    }

    static File builtin(Context c, String kind) {
        int id = builtinId(c, kind);
        if (id == 0) return null;
        File out = new File(c.getFilesDir(), "builtin_" + c.getResources().getResourceEntryName(id) + ".audio");
        try {
            long len;
            try (android.content.res.AssetFileDescriptor fd = c.getResources().openRawResourceFd(id)) { len = fd.getLength(); }
            if (out.exists() && out.length() == len) return out;
            try (java.io.InputStream in = c.getResources().openRawResource(id); java.io.FileOutputStream os = new java.io.FileOutputStream(out)) {
                byte[] b = new byte[16384]; int n;
                while ((n = in.read(b)) > 0) os.write(b, 0, n);
            }
            return out;
        } catch (Exception e) {
            return null;
        }
    }

    static void ensureChannels(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (nm == null) return;
        if (nm.getNotificationChannel(CH_AZAN) == null) {
            NotificationChannel ch = new NotificationChannel(CH_AZAN, "Azan", NotificationManager.IMPORTANCE_HIGH);
            ch.setSound(null, null);
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
        }
        if (nm.getNotificationChannel(CH_WAKTU) == null) {
            NotificationChannel ch = new NotificationChannel(CH_WAKTU, "Waktu solat", NotificationManager.IMPORTANCE_HIGH);
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
        }
        if (nm.getNotificationChannel(CH_INFO) == null) {
            NotificationChannel ch = new NotificationChannel(CH_INFO, "Maklumat", NotificationManager.IMPORTANCE_LOW);
            ch.setSound(null, null);
            nm.createNotificationChannel(ch);
        }
    }

    static Notification.Builder builder(Context c, String channel, String title, String body) {
        return new Notification.Builder(c, channel)
            .setSmallIcon(R.drawable.ic_stat_wazlee)
            .setColor(0xFF1565D8)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new Notification.BigTextStyle().bigText(body))
            .setCategory(Notification.CATEGORY_REMINDER)
            .setContentIntent(WzWidgets.open(c, "solat", 110))
            .setAutoCancel(true);
    }

    /** Notifikasi biasa (tanpa azan). silent = tanpa bunyi. */
    static void notify(Context c, String title, String body, boolean silent) {
        try {
            ensureChannels(c);
            NotificationManager nm = c.getSystemService(NotificationManager.class);
            if (nm != null) nm.notify(NOTIF_ID, builder(c, silent ? CH_INFO : CH_WAKTU, title, body).build());
        } catch (Exception ignored) {}
    }

    /** Simpan senarai jadual daripada app & jadualkan yang seterusnya. */
    static void save(Context c, JSONArray items, String stopLabel) {
        prefs(c).edit().putString("items", items.toString()).putString("stopLabel", stopLabel).apply();
        scheduleNext(c);
    }

    static void scheduleNext(Context c) {
        try {
            AlarmManager am = c.getSystemService(AlarmManager.class);
            if (am == null) return;
            Intent i = new Intent(c, WzAzanReceiver.class);
            i.setAction(ACT_FIRE);
            JSONArray items = new JSONArray(prefs(c).getString("items", "[]"));
            long now = System.currentTimeMillis();
            JSONObject next = null;
            for (int k = 0; k < items.length(); k++) {
                JSONObject o = items.optJSONObject(k);
                if (o == null) continue;
                long at = o.optLong("at");
                if (at > now + 1000 && (next == null || at < next.optLong("at"))) next = o;
            }
            PendingIntent old = PendingIntent.getBroadcast(c, 300, i, PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
            if (old != null) am.cancel(old);
            if (next == null) return;
            i.putExtra("title", next.optString("title"));
            i.putExtra("body", next.optString("body"));
            i.putExtra("kind", next.optString("kind", "notif"));
            i.putExtra("at", next.optLong("at"));
            PendingIntent pi = PendingIntent.getBroadcast(c, 300, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            long at = next.optLong("at");
            if (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
        } catch (Exception ignored) {}
    }
}
