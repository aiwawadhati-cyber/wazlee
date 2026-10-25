package my.digitalsys.wazlee;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WzStepsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
