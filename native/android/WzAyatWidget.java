package my.digitalsys.wazlee;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.os.Bundle;

public class WzAyatWidget extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        WzWidgets.update(c, WzWidgets.T_AYAT);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context c, AppWidgetManager m, int id, Bundle opts) {
        WzWidgets.update(c, WzWidgets.T_AYAT);
    }

    @Override
    public void onEnabled(Context c) {
        WzWidgets.updateAll(c);
    }
}
