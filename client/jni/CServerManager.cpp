/*
			Make By Square Studio The Owner Is JsonLz]Dev
*/

#include "CServerManager.h"
#include "dialog.h"

#include "main.h"

extern CDialogWindow *pDialogWindow;

#ifdef FLIN
	const CServerInstance::CServerInstanceEncrypted g_sEncryptedAddresses[MAX_SERVERS] = {
		CServerInstance::create(OBFUSCATE("sv.sa-mp.vn"), 1, 20, 7777, false),
		CServerInstance::create(OBFUSCATE("sv.sa-mp.vn"), 1, 20, 7777, false),
	};
#endif
