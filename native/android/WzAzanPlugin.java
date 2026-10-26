package my.digitalsys.wazlee;

import android.app.Activity;
import android.app.AlarmManager;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.OpenableColumns;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import org.json.JSONArray;

/** JS ↔ azan native: pilih fail, jadual, uji, henti. */
@CapacitorPlugin(name = "WzAzan")
public class WzAzanPlugin extends Plugin {

    private String pickKind = "azan";

    @PluginMethod
    public void getConfig(PluginCall call) {
        JSObject o = new JSObject();
        o.put("nameAzan", WzAzan.prefs(getContext()).getString("name_azan", ""));
        o.put("nameSubuh", WzAzan.prefs(getContext()).getString("name_subuh", ""));
        o.put("hasAzan", WzAzan.file(getContext(), "azan").exists());
        o.put("hasSubuh", WzAzan.file(getContext(), "subuh").exists());
        o.put("followSilent", WzAzan.prefs(getContext()).getBoolean("followSilent", false));
        AlarmManager am = getContext().getSystemService(AlarmManager.class);
        o.put("exact", Build.VERSION.SDK_INT < 31 || (am != null && am.canScheduleExactAlarms()));
        call.resolve(o);
    }

    @PluginMethod
    public void pick(PluginCall call) {
        pickKind = "subuh".equals(call.getString("kind")) ? "subuh" : "azan";
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("audio/*");
        startActivityForResult(call, i, "pickResult");
    }

    @ActivityCallback
    private void pickResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        try {
            if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
                call.reject("cancel");
                return;
            }
            Uri uri = result.getData().getData();
            String name = "azan";
            try (Cursor cur = getContext().getContentResolver().query(uri, null, null, null, null)) {
                if (cur != null && cur.moveToFirst()) {
                    int idx = cur.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                    if (idx >= 0) name = cur.getString(idx);
                }
            }
            File out = WzAzan.file(getContext(), pickKind);
            long total = 0;
            try (InputStream in = getContext().getContentResolver().openInputStream(uri); FileOutputStream os = new FileOutputStream(out)) {
                if (in == null) throw new Exception("no stream");
                byte[] buf = new byte[65536];
                int n;
                while ((n = in.read(buf)) > 0) {
                    total += n;
                    if (total > 25L * 1024 * 1024) throw new Exception("too large");
                    os.write(buf, 0, n);
                }
            }
            WzAzan.prefs(getContext()).edit().putString("name_" + pickKind, name).apply();
            JSObject o = new JSObject();
            o.put("name", name);
            o.put("kind", pickKind);
            call.resolve(o);
        } catch (Exception e) {
            WzAzan.file(getContext(), pickKind).delete();
            call.reject("error: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clear(PluginCall call) {
        String kind = "subuh".equals(call.getString("kind")) ? "subuh" : "azan";
        WzAzan.file(getContext(), kind).delete();
        WzAzan.prefs(getContext()).edit().remove("name_" + kind).apply();
        call.resolve();
    }

    @PluginMethod
    public void setOptions(PluginCall call) {
        Boolean fs = call.getBoolean("followSilent");
        if (fs != null) WzAzan.prefs(getContext()).edit().putBoolean("followSilent", fs).apply();
        call.resolve();
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        try {
            JSONArray items = call.getArray("items");
            WzAzan.save(getContext(), items == null ? new JSONArray() : items, call.getString("stopLabel", "Henti"));
            call.resolve();
        } catch (Exception e) {
            call.reject("schedule failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void test(PluginCall call) {
        String kind = "subuh".equals(call.getString("kind")) ? "subuh" : "azan";
        if (WzAzan.playable(getContext(), kind) == null) {
            call.reject("nofile");
            return;
        }
        Intent s = new Intent(getContext(), WzAzanService.class);
        s.putExtra("title", call.getString("title", "Wazlee"));
        s.putExtra("body", call.getString("body", ""));
        s.putExtra("kind", kind);
        getContext().startForegroundService(s);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Intent s = new Intent(getContext(), WzAzanService.class);
        s.setAction(WzAzanService.ACT_STOP);
        try { getContext().startService(s); } catch (Exception ignored) {}
        call.resolve();
    }
}
