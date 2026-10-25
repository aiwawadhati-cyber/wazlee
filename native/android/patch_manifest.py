"""Tampal AndroidManifest.xml: kebenaran, orientasi, widget & penerima siaran Wazlee."""
import re, sys
p = sys.argv[1] if len(sys.argv) > 1 else 'android/app/src/main/AndroidManifest.xml'
s = open(p, encoding='utf-8').read()

PERMS = ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'ACTIVITY_RECOGNITION', 'VIBRATE', 'POST_NOTIFICATIONS',
         'SCHEDULE_EXACT_ALARM', 'RECEIVE_BOOT_COMPLETED']
add = ''.join(f'    <uses-permission android:name="android.permission.{x}" />\n' for x in PERMS if f'android.permission.{x}"' not in s)
add += '    <uses-feature android:name="android.hardware.location.gps" android:required="false" />\n'
add += '    <uses-feature android:name="android.hardware.sensor.stepcounter" android:required="false" />\n'
s = s.replace('</manifest>', add + '</manifest>', 1)

if 'android:screenOrientation' not in s:
    s = s.replace('<activity', '<activity android:screenOrientation="portrait"', 1)

W = [('WzPrayerFullWidget', 'prayer_full'), ('WzPrayerNextWidget', 'prayer_next'), ('WzAyatWidget', 'ayat'),
     ('WzActivityWidget', 'activity'), ('WzTasbihWidget', 'tasbih'), ('WzZikirWidget', 'zikir')]
rx = ''
for cls, k in W:
    rx += f'''        <receiver android:name=".{cls}" android:exported="true" android:label="@string/wz_n_{k}">
            <intent-filter><action android:name="android.appwidget.action.APPWIDGET_UPDATE" /></intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/wz_info_{k}" />
        </receiver>
'''
rx += '''        <receiver android:name=".WzWidgetReceiver" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.TIME_SET" />
                <action android:name="android.intent.action.TIMEZONE_CHANGED" />
                <action android:name="android.intent.action.DATE_CHANGED" />
                <action android:name="android.intent.action.LOCALE_CHANGED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
            </intent-filter>
        </receiver>
'''
if 'WzWidgetReceiver' not in s:
    s = s.replace('</application>', rx + '    </application>', 1)
open(p, 'w', encoding='utf-8').write(s)
print('manifest patched:', p)
