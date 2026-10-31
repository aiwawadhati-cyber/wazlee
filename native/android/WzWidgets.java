package my.digitalsys.wazlee;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextDirectionHeuristics;
import android.text.TextPaint;
import android.text.TextUtils;
import android.util.TypedValue;
import android.widget.RemoteViews;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

/** Teras widget skrin utama Wazlee: data, lukisan, penjadualan. */
public final class WzWidgets {

    static final String PREFS = "wz_widget";
    static final String KEY_DATA = "data";
    static final String KEY_STATE = "state";
    static final String ACT_TICK = "my.digitalsys.wazlee.WZ_TICK";
    static final String ACT_WATER = "my.digitalsys.wazlee.WZ_WATER";
    static final String ACT_TAS = "my.digitalsys.wazlee.WZ_TASBIH";
    static final String ACT_TAS_RESET = "my.digitalsys.wazlee.WZ_TASBIH_RESET";
    static final String ACT_OPEN = "my.digitalsys.wazlee.WZ_OPEN";

    static final int T_FULL = 1, T_NEXT = 2, T_AYAT = 4, T_ACT = 8, T_TAS = 16, T_ZK = 32, T_ALL = 63;

    private static final int BLUE = 0xFF1565D8;
    private static final int WHITE = 0xFFFFFFFF;
    private static final int DIM = 0x99FFFFFF;

    /* indeks masa dalam tatasusunan "t": imsak, subuh, syuruk, dhuha, zohor, asar, maghrib, isyak */
    private static final int[] MAIN = { 1, 4, 5, 6, 7 };
    private static final int[] ROW = { 1, 2, 4, 5, 6, 7 };
    private static final int[] ICONS = {
        R.drawable.wz_ic_imsak, R.drawable.wz_ic_subuh, R.drawable.wz_ic_syuruk, R.drawable.wz_ic_syuruk,
        R.drawable.wz_ic_zohor, R.drawable.wz_ic_asar, R.drawable.wz_ic_maghrib, R.drawable.wz_ic_isyak
    };
    private static final int[] CELL = { R.id.wz_c0, R.id.wz_c1, R.id.wz_c2, R.id.wz_c3, R.id.wz_c4, R.id.wz_c5 };
    private static final int[] CELL_I = { R.id.wz_i0, R.id.wz_i1, R.id.wz_i2, R.id.wz_i3, R.id.wz_i4, R.id.wz_i5 };
    private static final int[] CELL_T = { R.id.wz_t0, R.id.wz_t1, R.id.wz_t2, R.id.wz_t3, R.id.wz_t4, R.id.wz_t5 };
    private static final int[] CELL_N = { R.id.wz_n0, R.id.wz_n1, R.id.wz_n2, R.id.wz_n3, R.id.wz_n4, R.id.wz_n5 };

    private WzWidgets() {}

    /* ------------------------------------------------------------------ data */

    static SharedPreferences prefs(Context c) {
        return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static JSONObject read(Context c, String key) {
        try {
            String s = prefs(c).getString(key, null);
            return s == null ? new JSONObject() : new JSONObject(s);
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    static void write(Context c, String key, JSONObject o) {
        prefs(c).edit().putString(key, o.toString()).apply();
    }

    static String dayKey(Calendar cal) {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(cal.getTime());
    }

    static String today() {
        return dayKey(Calendar.getInstance());
    }

    static String lbl(JSONObject d, String k, String def) {
        JSONObject l = d.optJSONObject("lbl");
        return l == null ? def : l.optString(k, def);
    }

    /** Gabung data app dengan keadaan widget (air & tasbih): yang terbaharu menang. */
    static void mergeFromApp(Context c, JSONObject data) {
        try {
            JSONObject st = read(c, KEY_STATE);
            for (String k : new String[] { "water", "tasbih" }) {
                JSONObject in = data.optJSONObject(k);
                if (in == null) continue;
                JSONObject cur = st.optJSONObject(k);
                if (cur == null || in.optLong("t", 0) >= cur.optLong("t", 0)) st.put(k, in);
            }
            write(c, KEY_STATE, st);
            write(c, KEY_DATA, data);
        } catch (Exception ignored) {}
    }

    /* --------------------------------------------------------------- intents */

    static PendingIntent open(Context c, String route, int req) {
        Intent i = new Intent(c, MainActivity.class);
        i.setAction(ACT_OPEN + "." + req);
        i.putExtra("wz_route", route);
        i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static PendingIntent broadcast(Context c, String action, int req) {
        Intent i = new Intent(c, WzWidgetReceiver.class);
        i.setAction(action);
        return PendingIntent.getBroadcast(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void vibrate(Context c, long ms) {
        try {
            Vibrator v = c.getSystemService(Vibrator.class);
            if (v != null && v.hasVibrator()) v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
        } catch (Exception ignored) {}
    }

    /* -------------------------------------------------------------- kemas kini */

    static void updateAll(Context c) {
        update(c, T_ALL);
    }

    /* Tema warna dipilih dalam app (Profil → Penampilan) */
    static String theme = "biru";
    static boolean followTheme = true;
    static int bgRes(String th) {
        switch (th) {
            case "pink": return R.drawable.wz_bg_pink;
            case "ungu": return R.drawable.wz_bg_purple;
            case "hijau": return R.drawable.wz_bg_green;
            case "teal": return R.drawable.wz_bg_teal;
            case "jingga": return R.drawable.wz_bg_orange;
            default: return R.drawable.wz_bg_blue;
        }
    }
    static int accent(String th) {
        switch (th) {
            case "pink": return 0xFFE83E8C;
            case "ungu": return 0xFF6D4AE8;
            case "hijau": return 0xFF0E9F5A;
            case "teal": return 0xFF0B9488;
            case "jingga": return 0xFFF2700F;
            default: return BLUE;
        }
    }

    static void update(Context c, int mask) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        JSONObject d = read(c, KEY_DATA), st = read(c, KEY_STATE);
        theme = d.optString("theme", "biru"); followTheme = !"asal".equals(d.optString("wcol", "tema"));
        if ((mask & T_FULL) != 0) for (int id : ids(c, m, WzPrayerFullWidget.class)) safe(m, id, () -> prayerFull(c, d));
        if ((mask & T_NEXT) != 0) for (int id : ids(c, m, WzPrayerNextWidget.class)) safe(m, id, () -> prayerNext(c, d));
        if ((mask & T_AYAT) != 0) for (int id : ids(c, m, WzAyatWidget.class)) safe(m, id, () -> ayat(c, d, m.getAppWidgetOptions(id)));
        if ((mask & T_ACT) != 0) for (int id : ids(c, m, WzActivityWidget.class)) safe(m, id, () -> activity(c, d, st));
        if ((mask & T_TAS) != 0) for (int id : ids(c, m, WzTasbihWidget.class)) safe(m, id, () -> tasbih(c, d, st));
        if ((mask & T_ZK) != 0) for (int id : ids(c, m, WzZikirWidget.class)) safe(m, id, () -> zikir(c, d));
        schedule(c, d);
    }

    interface ViewsFactory { RemoteViews make(); }

    private static void safe(AppWidgetManager m, int id, ViewsFactory f) {
        try {
            RemoteViews v = f.make();
            if (followTheme) v.setInt(R.id.wz_root, "setBackgroundResource", bgRes(theme));
            m.updateAppWidget(id, v);
        } catch (Exception ignored) {}
    }

    private static int[] ids(Context c, AppWidgetManager m, Class<?> cls) {
        return m.getAppWidgetIds(new ComponentName(c, cls));
    }

    /* ------------------------------------------------------------ waktu solat */

    private static JSONObject day(JSONObject d, Calendar cal) {
        JSONObject days = d.optJSONObject("days");
        return days == null ? null : days.optJSONObject(dayKey(cal));
    }

    /** Mencari solat seterusnya: {indeks, milisaat epoch}. */
    private static long[] nextPrayer(JSONObject d) {
        Calendar now = Calendar.getInstance();
        for (int add = 0; add < 3; add++) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_YEAR, add);
            JSONObject dd = day(d, cal);
            if (dd == null) continue;
            JSONArray t = dd.optJSONArray("t");
            if (t == null) continue;
            for (int k : MAIN) {
                long at = atMinutes(cal, t.optInt(k));
                if (at > now.getTimeInMillis()) return new long[] { k, at };
            }
        }
        return null;
    }

    private static long atMinutes(Calendar base, int minutes) {
        Calendar c = (Calendar) base.clone();
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis() + minutes * 60000L;
    }

    private static String fmt(JSONObject d, int minutes, boolean suffix) {
        int h = (minutes / 60) % 24, m = minutes % 60;
        if ("24".equals(d.optString("fmt", "12"))) return String.format(Locale.US, "%02d:%02d", h, m);
        String s = String.format(Locale.US, "%d:%02d", ((h + 11) % 12) + 1, m);
        return suffix ? s + " " + lbl(d, h < 12 ? "am" : "pm", h < 12 ? "am" : "pm") : s;
    }

    private static Locale locale(JSONObject d) {
        return "en".equals(d.optString("lang")) ? Locale.forLanguageTag("en-MY") : Locale.forLanguageTag("ms-MY");
    }

    private static String name(JSONObject d, int k) {
        JSONArray n = d.optJSONArray("names");
        return n == null ? "" : n.optString(k, "");
    }

    private static void countdown(RemoteViews v, int id, long at) {
        long base = SystemClock.elapsedRealtime() + (at - System.currentTimeMillis());
        v.setChronometer(id, base, null, true);
        v.setChronometerCountDown(id, true);
    }

    static RemoteViews prayerFull(Context c, JSONObject d) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.wz_w_prayer_full);
        v.setOnClickPendingIntent(R.id.wz_root, open(c, "solat", 101));
        Calendar cal = Calendar.getInstance();
        v.setTextViewText(R.id.wz_date, new SimpleDateFormat("EEE, d MMM yyyy", locale(d)).format(new Date()));
        JSONObject dd = day(d, cal);
        if (dd == null) {
            v.setTextViewText(R.id.wz_hijri, lbl(d, "open", "Buka Wazlee untuk kemas kini"));
            v.setTextViewText(R.id.wz_zone, d.optString("zone", "Wazlee"));
            v.setTextViewText(R.id.wz_next_lbl, "");
            return v;
        }
        v.setTextViewText(R.id.wz_hijri, dd.optString("h", ""));
        v.setTextViewText(R.id.wz_zone, d.optString("zone", ""));
        JSONArray t = dd.optJSONArray("t");
        boolean ramadan = dd.optInt("r", 0) == 1;
        long[] nx = nextPrayer(d);
        long now = System.currentTimeMillis();
        for (int i = 0; i < 6; i++) {
            int k = ROW[i];
            if (ramadan && k == 2) k = 0; // Imsak menggantikan Syuruk pada bulan Ramadan
            long at = atMinutes(cal, t.optInt(k));
            boolean isNext = nx != null && nx[0] == k && Math.abs(nx[1] - at) < 60000;
            boolean past = !isNext && at <= now;
            v.setTextViewText(CELL_T[i], fmt(d, t.optInt(k), false));
            v.setTextViewText(CELL_N[i], name(d, k));
            v.setImageViewResource(CELL_I[i], ICONS[k]);
            v.setInt(CELL[i], "setBackgroundResource", isNext ? R.drawable.wz_cell_hl : R.drawable.wz_cell);
            int col = isNext ? accent(theme) : past ? DIM : WHITE;
            v.setTextColor(CELL_T[i], col);
            v.setTextColor(CELL_N[i], col);
            v.setInt(CELL_I[i], "setColorFilter", col);
            v.setInt(CELL_I[i], "setImageAlpha", past ? 150 : 255);
        }
        if (nx != null) {
            v.setTextViewText(R.id.wz_next_lbl, lbl(d, "in", "{p} dalam").replace("{p}", name(d, (int) nx[0])));
            countdown(v, R.id.wz_count, nx[1]);
        }
        return v;
    }

    static RemoteViews prayerNext(Context c, JSONObject d) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.wz_w_prayer_next);
        v.setOnClickPendingIntent(R.id.wz_root, open(c, "solat", 102));
        v.setTextViewText(R.id.wz_zone, d.optString("zone", "Wazlee"));
        long[] nx = nextPrayer(d);
        if (nx == null) {
            v.setTextViewText(R.id.wz_next_name, lbl(d, "open", "Buka Wazlee"));
            v.setTextViewText(R.id.wz_next_time, "");
            return v;
        }
        int k = (int) nx[0];
        Calendar at = Calendar.getInstance();
        at.setTimeInMillis(nx[1]);
        int mins = at.get(Calendar.HOUR_OF_DAY) * 60 + at.get(Calendar.MINUTE);
        v.setImageViewResource(R.id.wz_next_ic, ICONS[k]);
        v.setTextViewText(R.id.wz_next_name, name(d, k));
        v.setTextViewText(R.id.wz_next_time, fmt(d, mins, true));
        countdown(v, R.id.wz_count, nx[1]);
        return v;
    }

    /* --------------------------------------------------------- ayat hari ini */

    private static Typeface amiri;

    static RemoteViews ayat(Context c, JSONObject d, Bundle opts) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.wz_w_ayat);
        v.setTextViewText(R.id.wz_title, lbl(d, "ayat", "Ayat Hari Ini"));
        JSONArray list = d.optJSONArray("ayat");
        JSONObject a = null;
        if (list != null) {
            String td = today();
            for (int i = 0; i < list.length(); i++) {
                JSONObject o = list.optJSONObject(i);
                if (o != null && td.equals(o.optString("d"))) { a = o; break; }
            }
            if (a == null && list.length() > 0) a = list.optJSONObject(0);
        }
        if (a == null) {
            v.setTextViewText(R.id.wz_ref, "");
            v.setTextViewText(R.id.wz_tr, lbl(d, "open", "Buka Wazlee untuk kemas kini"));
            v.setOnClickPendingIntent(R.id.wz_root, open(c, "quran", 103));
            return v;
        }
        v.setTextViewText(R.id.wz_ref, a.optString("ref"));
        v.setTextViewText(R.id.wz_tr, a.optString("tr"));
        v.setOnClickPendingIntent(R.id.wz_root, open(c, "surah:" + a.optInt("s") + ":" + a.optInt("a"), 103));
        float dens = c.getResources().getDisplayMetrics().density;
        int wDp = 260, hDp = 160;
        if (opts != null) {
            wDp = Math.max(160, opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, wDp));
            hDp = Math.max(100, opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, hDp));
        }
        int wPx = (int) ((wDp - 24) * dens);
        int hPx = (int) (Math.max(48, hDp - 24 - 22 - 52) * dens);
        Bitmap bmp = renderArabic(c, a.optString("ar"), wPx, hPx);
        if (bmp != null) v.setImageViewBitmap(R.id.wz_ar, bmp);
        return v;
    }

    static Bitmap renderArabic(Context c, String text, int wPx, int hPx) {
        try {
            if (amiri == null) amiri = c.getResources().getFont(R.font.amiri);
            TextPaint p = new TextPaint(TextPaint.ANTI_ALIAS_FLAG);
            p.setTypeface(amiri);
            p.setColor(Color.WHITE);
            float sp = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, 1, c.getResources().getDisplayMetrics());
            StaticLayout lay = null;
            for (float size = 24; size >= 13; size -= 1) {
                p.setTextSize(size * sp);
                lay = StaticLayout.Builder.obtain(text, 0, text.length(), p, wPx)
                    .setAlignment(Layout.Alignment.ALIGN_CENTER)
                    .setTextDirection(TextDirectionHeuristics.RTL)
                    .setLineSpacing(0, 1.05f)
                    .setIncludePad(true)
                    .build();
                if (lay.getHeight() <= hPx) break;
            }
            if (lay != null && lay.getHeight() > hPx) {
                int lines = 1;
                while (lines < lay.getLineCount() && lay.getLineBottom(lines) <= hPx) lines++;
                lay = StaticLayout.Builder.obtain(text, 0, text.length(), p, wPx)
                    .setAlignment(Layout.Alignment.ALIGN_CENTER)
                    .setTextDirection(TextDirectionHeuristics.RTL)
                    .setLineSpacing(0, 1.05f)
                    .setMaxLines(Math.max(1, lines))
                    .setEllipsize(TextUtils.TruncateAt.END)
                    .build();
            }
            if (lay == null) return null;
            Bitmap b = Bitmap.createBitmap(wPx, Math.max(1, lay.getHeight()), Bitmap.Config.ARGB_8888);
            lay.draw(new Canvas(b));
            return b;
        } catch (Exception e) {
            return null;
        }
    }

    /* ------------------------------------------------------- langkah & air */

    static JSONObject water(JSONObject d, JSONObject st) {
        JSONObject w = st.optJSONObject("water");
        if (w == null) w = d.optJSONObject("water");
        return w == null ? new JSONObject() : w;
    }

    static RemoteViews activity(Context c, JSONObject d, JSONObject st) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.wz_w_activity);
        String td = today();
        JSONObject s = d.optJSONObject("steps");
        int n = 0, goal = 8000;
        String sub = lbl(d, "stepsOpen", "buka app");
        if (s != null) {
            goal = Math.max(1, s.optInt("goal", 8000));
            if (td.equals(s.optString("date"))) {
                n = s.optInt("n", 0);
                sub = lbl(d, "updated", "dikemas kini") + " " + s.optString("at", "");
            }
        }
        v.setTextViewText(R.id.wz_steps, String.format(locale(d), "%,d", n));
        v.setTextViewText(R.id.wz_steps_sub, sub);
        v.setProgressBar(R.id.wz_ring, 100, Math.min(100, n * 100 / goal), false);
        JSONObject w = water(d, st);
        JSONObject wd = d.optJSONObject("water");
        int wGoal = wd == null ? 8 : wd.optInt("goal", 8);
        int wn = td.equals(w.optString("date")) ? w.optInt("n", 0) : 0;
        v.setTextViewText(R.id.wz_water, wn + "/" + wGoal);
        v.setTextViewText(R.id.wz_water_lbl, lbl(d, "glasses", "gelas"));
        v.setOnClickPendingIntent(R.id.wz_steps_box, open(c, "langkah", 104));
        v.setOnClickPendingIntent(R.id.wz_water, open(c, "air", 105));
        v.setOnClickPendingIntent(R.id.wz_water_add, broadcast(c, ACT_WATER, 201));
        return v;
    }

    /* --------------------------------------------------------------- tasbih */

    static JSONObject tasbihState(JSONObject d, JSONObject st) {
        JSONObject t = st.optJSONObject("tasbih");
        if (t == null) t = d.optJSONObject("tasbih");
        return t == null ? new JSONObject() : t;
    }

    static RemoteViews tasbih(Context c, JSONObject d, JSONObject st) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.wz_w_tasbih);
        JSONObject t = tasbihState(d, st);
        v.setTextViewText(R.id.wz_dz, t.optString("dz", "Subhanallah"));
        v.setTextViewText(R.id.wz_count_tas, String.valueOf(t.optInt("count", 0)));
        v.setTextViewText(R.id.wz_goal, "/ " + t.optInt("goal", 33));
        v.setTextViewText(R.id.wz_total, lbl(d, "total", "Jumlah") + ": " + String.format(locale(d), "%,d", t.optInt("total", 0)));
        v.setOnClickPendingIntent(R.id.wz_tap, broadcast(c, ACT_TAS, 202));
        v.setOnClickPendingIntent(R.id.wz_reset, broadcast(c, ACT_TAS_RESET, 203));
        return v;
    }

    /* ---------------------------------------------------------------- zikir */

    static RemoteViews zikir(Context c, JSONObject d) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.wz_w_zikir);
        boolean petang = Calendar.getInstance().get(Calendar.HOUR_OF_DAY) >= 15;
        String mode = petang ? "petang" : "pagi";
        JSONObject z = d.optJSONObject("zikir");
        int done = 0, total = 0;
        if (z != null) {
            JSONArray arr = z.optJSONArray(mode);
            if (arr != null) {
                total = arr.optInt(1, 0);
                if (today().equals(z.optString("date"))) done = arr.optInt(0, 0);
            }
        }
        v.setImageViewResource(R.id.wz_zk_ic, petang ? R.drawable.wz_ic_maghrib : R.drawable.wz_ic_subuh);
        v.setTextViewText(R.id.wz_zk_title, lbl(d, petang ? "zkPetang" : "zkPagi", petang ? "Zikir Petang" : "Zikir Pagi"));
        v.setTextViewText(R.id.wz_zk_count, done + "/" + total);
        v.setProgressBar(R.id.wz_zk_bar, 100, total == 0 ? 0 : Math.min(100, done * 100 / total), false);
        v.setTextViewText(R.id.wz_zk_sub, done >= total && total > 0 ? lbl(d, "zkDone", "Selesai hari ini ✓") : lbl(d, "zkTap", "Ketik untuk mula berzikir"));
        v.setOnClickPendingIntent(R.id.wz_root, open(c, "zikir:" + mode, 106));
        return v;
    }

    /* ---------------------------------------------------------- penjadualan */

    static void schedule(Context c, JSONObject d) {
        try {
            Calendar now = Calendar.getInstance();
            long n = now.getTimeInMillis();
            long best = Long.MAX_VALUE;
            JSONObject dd = day(d, now);
            if (dd != null) {
                JSONArray t = dd.optJSONArray("t");
                for (int k = 0; t != null && k < t.length(); k++) {
                    long at = atMinutes(now, t.optInt(k));
                    if (at > n + 1000 && at < best) best = at;
                }
            }
            long three = atMinutes(now, 15 * 60);
            if (three > n + 1000 && three < best) best = three;
            Calendar mid = (Calendar) now.clone();
            mid.add(Calendar.DAY_OF_YEAR, 1);
            long midnight = atMinutes(mid, 0) + 30000;
            if (midnight < best) best = midnight;

            AlarmManager am = c.getSystemService(AlarmManager.class);
            if (am == null) return;
            PendingIntent pi = broadcast(c, ACT_TICK, 200);
            if (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()) am.setExactAndAllowWhileIdle(AlarmManager.RTC, best, pi);
            else am.setAndAllowWhileIdle(AlarmManager.RTC, best, pi);
        } catch (Exception ignored) {}
    }
}
