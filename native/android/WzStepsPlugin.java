package my.digitalsys.wazlee;

import android.Manifest;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.util.ArrayList;
import java.util.List;

/**
 * Membaca kaunter langkah perkakasan (TYPE_STEP_COUNTER) — jumlah kumulatif sejak telefon dihidupkan.
 * Kiraan harian dibuat di sisi JS menggunakan nilai asas (baseline).
 */
@CapacitorPlugin(
    name = "WzSteps",
    permissions = { @Permission(alias = "activity", strings = { Manifest.permission.ACTIVITY_RECOGNITION }) }
)
public class WzStepsPlugin extends Plugin implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor stepCounter;
    private float lastValue = -1f;
    private boolean registered = false;
    private boolean watching = false;
    private final List<PluginCall> pending = new ArrayList<>();
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepCounter = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        }
    }

    private boolean permitted() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return getPermissionState("activity") == PermissionState.GRANTED;
        }
        return true;
    }

    private void ensureRegistered() {
        if (!registered && sensorManager != null && stepCounter != null) {
            registered = sensorManager.registerListener(this, stepCounter, SensorManager.SENSOR_DELAY_UI);
        }
    }

    private void unregisterIfIdle() {
        if (registered && !watching && pending.isEmpty() && sensorManager != null) {
            sensorManager.unregisterListener(this);
            registered = false;
        }
    }

    private JSObject payload() {
        JSObject r = new JSObject();
        r.put("available", stepCounter != null);
        r.put("counter", lastValue);
        r.put("bootTime", System.currentTimeMillis() - android.os.SystemClock.elapsedRealtime());
        return r;
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject r = new JSObject();
        r.put("available", stepCounter != null);
        r.put("permitted", permitted());
        call.resolve(r);
    }

    @PluginMethod
    public void read(PluginCall call) {
        if (stepCounter == null) {
            call.resolve(payload());
            return;
        }
        if (!permitted()) {
            call.reject("PERMISSION");
            return;
        }
        if (registered && lastValue >= 0) {
            call.resolve(payload());
            return;
        }
        pending.add(call);
        ensureRegistered();
        handler.postDelayed(() -> {
            if (pending.remove(call)) {
                call.resolve(payload());
                unregisterIfIdle();
            }
        }, 4000);
    }

    @PluginMethod
    public void watch(PluginCall call) {
        if (stepCounter == null || !permitted()) {
            call.reject(stepCounter == null ? "UNAVAILABLE" : "PERMISSION");
            return;
        }
        watching = true;
        ensureRegistered();
        call.resolve();
    }

    @PluginMethod
    public void unwatch(PluginCall call) {
        watching = false;
        unregisterIfIdle();
        call.resolve();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() != Sensor.TYPE_STEP_COUNTER) return;
        lastValue = event.values[0];
        JSObject p = payload();
        if (!pending.isEmpty()) {
            List<PluginCall> copy = new ArrayList<>(pending);
            pending.clear();
            for (PluginCall c : copy) c.resolve(p);
        }
        if (watching) notifyListeners("step", p);
        unregisterIfIdle();
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override
    protected void handleOnPause() {
        if (registered && sensorManager != null) {
            sensorManager.unregisterListener(this);
            registered = false;
        }
        super.handleOnPause();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (watching) ensureRegistered();
    }
}
