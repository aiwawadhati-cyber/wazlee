package my.digitalsys.wazlee;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;

/** Jambatan JS ↔ widget: hantar data, baca keadaan widget, terima laluan dari ketikan widget. */
@CapacitorPlugin(name = "WzWidget")
public class WzWidgetPlugin extends Plugin {

    private static String pendingRoute = null;

    @Override
    public void load() {
        try {
            if (getActivity() != null) takeRoute(getActivity().getIntent(), false);
        } catch (Exception ignored) {}
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        takeRoute(intent, true);
    }

    private void takeRoute(Intent intent, boolean notify) {
        if (intent == null) return;
        String r = intent.getStringExtra("wz_route");
        if (r == null) return;
        intent.removeExtra("wz_route");
        pendingRoute = r;
        if (notify) {
            JSObject o = new JSObject();
            o.put("route", r);
            notifyListeners("route", o);
        }
    }

    @PluginMethod
    public void update(PluginCall call) {
        try {
            JSONObject data = new JSONObject(call.getData().toString());
            WzWidgets.mergeFromApp(getContext(), data);
            WzWidgets.updateAll(getContext());
            call.resolve();
        } catch (Exception e) {
            call.reject("update failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getState(PluginCall call) {
        try {
            call.resolve(new JSObject(WzWidgets.read(getContext(), WzWidgets.KEY_STATE).toString()));
        } catch (Exception e) {
            call.resolve(new JSObject());
        }
    }

    @PluginMethod
    public void consumeRoute(PluginCall call) {
        JSObject o = new JSObject();
        o.put("route", pendingRoute);
        pendingRoute = null;
        call.resolve(o);
    }
}
