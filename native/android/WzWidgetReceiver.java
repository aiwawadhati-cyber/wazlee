package my.digitalsys.wazlee;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import org.json.JSONObject;

/** Menerima ketikan butang widget (air, tasbih) dan detik penjadualan. */
public class WzWidgetReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context c, Intent intent) {
        String a = intent == null ? null : intent.getAction();
        if (a == null) return;
        try {
            if (WzWidgets.ACT_WATER.equals(a)) {
                JSONObject st = WzWidgets.read(c, WzWidgets.KEY_STATE), d = WzWidgets.read(c, WzWidgets.KEY_DATA);
                JSONObject w = WzWidgets.water(d, st);
                String td = WzWidgets.today();
                int n = td.equals(w.optString("date")) ? w.optInt("n", 0) : 0;
                JSONObject nw = new JSONObject();
                nw.put("date", td);
                nw.put("n", Math.min(20, n + 1));
                nw.put("t", System.currentTimeMillis());
                st.put("water", nw);
                WzWidgets.write(c, WzWidgets.KEY_STATE, st);
                WzWidgets.vibrate(c, 30);
                WzWidgets.update(c, WzWidgets.T_ACT);
            } else if (WzWidgets.ACT_TAS.equals(a) || WzWidgets.ACT_TAS_RESET.equals(a)) {
                JSONObject st = WzWidgets.read(c, WzWidgets.KEY_STATE), d = WzWidgets.read(c, WzWidgets.KEY_DATA);
                JSONObject t = new JSONObject(WzWidgets.tasbihState(d, st).toString());
                int goal = Math.max(1, t.optInt("goal", 33));
                int count = t.optInt("count", 0);
                if (WzWidgets.ACT_TAS_RESET.equals(a)) {
                    count = 0;
                    WzWidgets.vibrate(c, 15);
                } else {
                    count++;
                    t.put("total", t.optInt("total", 0) + 1);
                    if (count >= goal) {
                        count = 0;
                        WzWidgets.vibrate(c, 300);
                    } else {
                        WzWidgets.vibrate(c, 25);
                    }
                }
                t.put("count", count);
                t.put("goal", goal);
                t.put("t", System.currentTimeMillis());
                st.put("tasbih", t);
                WzWidgets.write(c, WzWidgets.KEY_STATE, st);
                WzWidgets.update(c, WzWidgets.T_TAS);
            } else {
                // WZ_TICK, BOOT_COMPLETED, TIME_SET, TIMEZONE_CHANGED, DATE_CHANGED, MY_PACKAGE_REPLACED
                WzWidgets.updateAll(c);
                if (!WzWidgets.ACT_TICK.equals(a)) WzAzan.scheduleNext(c);
            }
        } catch (Exception ignored) {}
    }
}
