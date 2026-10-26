package my.digitalsys.wazlee;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import java.io.File;

/** Dicetuskan oleh AlarmManager pada waktu solat. */
public class WzAzanReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context c, Intent intent) {
        try {
            if (intent == null || !WzAzan.ACT_FIRE.equals(intent.getAction())) return;
            long at = intent.getLongExtra("at", 0);
            // abaikan jika terlalu lewat (cth. telefon dimatikan lama)
            if (at > 0 && System.currentTimeMillis() - at > 20 * 60000L) return;
            String title = intent.getStringExtra("title"), body = intent.getStringExtra("body"), kind = intent.getStringExtra("kind");
            if ("silent".equals(kind)) return;
            if ("azan".equals(kind) || "subuh".equals(kind)) {
                File f = WzAzan.playable(c, kind);
                boolean followSilent = WzAzan.prefs(c).getBoolean("followSilent", false);
                AudioManager am = c.getSystemService(AudioManager.class);
                boolean phoneSilent = am != null && am.getRingerMode() != AudioManager.RINGER_MODE_NORMAL;
                if (f != null && !(followSilent && phoneSilent)) {
                    Intent s = new Intent(c, WzAzanService.class);
                    s.putExtra("title", title);
                    s.putExtra("body", body);
                    s.putExtra("kind", kind);
                    c.startForegroundService(s);
                    return;
                }
            }
            WzAzan.notify(c, title, body, false);
        } catch (Exception e) {
            WzAzan.notify(c, intent.getStringExtra("title"), intent.getStringExtra("body"), false);
        } finally {
            WzAzan.scheduleNext(c);
        }
    }
}
