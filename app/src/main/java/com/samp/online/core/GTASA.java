package com.samp.online.core;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.WindowManager;

import com.wardrumstudios.utils.WarMedia;

public class GTASA extends WarMedia {
    public static GTASA gtasaSelf = null;
    static String vmVersion;
    private boolean once = false;

        static {
        vmVersion = null;
        System.out.println("**** Loading SO's");

        // 1. KÍCH HOẠT AML ĐẦU TIÊN
        try {
            System.out.println("**** [Launcher] Đang kích hoạt Android Mod Loader (AML)...");
            System.loadLibrary("aml"); 
        } catch (UnsatisfiedLinkError e) {
            System.out.println("**** [Launcher] Không tìm thấy libaml.so, thử nạp qua tên khác...");
            try {
                System.loadLibrary("modloader"); // Phòng trường hợp file .so bị đổi tên thành libmodloader.so
            } catch (UnsatisfiedLinkError ex) {
                System.out.println("**** [Launcher] Thất bại! Cả aml và modloader đều không tồn tại.");
            }
        }

        // 2. Kích hoạt các thư viện giả lập hệ thống (nếu có)
        try {
            vmVersion = System.getProperty("java.vm.version");
            System.out.println("vmVersion " + vmVersion);
            System.loadLibrary("ImmEmulatorJ");
        } catch (ExceptionInInitializerError | UnsatisfiedLinkError e) {
        }

        // 3. NẠP GAME GỐC VÀ SAMP CLIENT
        System.loadLibrary("GTASA");
        System.loadLibrary("samp");
    }

    public static void staticEnterSocialClub() {
        gtasaSelf.EnterSocialClub();
    }

    public static void staticExitSocialClub() {
        gtasaSelf.ExitSocialClub();
    }

    public void AfterDownloadFunction() {

    }

    public void EnterSocialClub() {

    }

    public void ExitSocialClub() {

    }

    public boolean ServiceAppCommand(String str, String str2) {
        return false;
    }

    public int ServiceAppCommandValue(String str, String str2) {
        return 0;
    }

    public native void main();

    @Override
    public void onActivityResult(int i, int i2, Intent intent) {
        super.onActivityResult(i, i2, intent);
    }

    @Override
    public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
    }

    @Override
    public void onCreate(Bundle bundle) {
        if (!once) {
            once = true;
        }

        System.out.println("GTASA onCreate");

        gtasaSelf = this;

        wantsMultitouch = true;
        wantsAccelerometer = true;

        super.onCreate(bundle);

        // FIX KEYBOARD CHE DIALOG
        // SOFT_INPUT_ADJUST_PAN: Pan the window, không resize, dialog luôn visible
        getWindow().setSoftInputMode(
                WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN |
                WindowManager.LayoutParams.SOFT_INPUT_STATE_HIDDEN
        );
    }

    @Override
    public void onDestroy() {
        System.out.println("GTASA onDestroy");
        super.onDestroy();
    }

    @Override
    public boolean onKeyDown(int i, KeyEvent keyEvent) {
        return super.onKeyDown(i, keyEvent);
    }

    @Override
    public void onPause() {
        System.out.println("GTASA onPause");
        super.onPause();
    }

    @Override
    public void onRestart() {
        System.out.println("GTASA onRestart");
        super.onRestart();
    }

    @Override
    public void onResume() {
        System.out.println("GTASA onResume");
        super.onResume();
    }

    @Override
    public void onStart() {
        System.out.println("GTASA onStart");
        super.onStart();
    }

    @Override
    public void onStop() {
        System.out.println("GTASA onStop");
        super.onStop();
    }

    public native void setCurrentScreenSize(int i, int i2);
}
